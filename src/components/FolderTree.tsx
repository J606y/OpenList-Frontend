import {
  Box,
  Button,
  createDisclosure,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  VStack,
  useColorMode,
} from "@hope-ui/solid"
import { BiSolidRightArrow, BiSolidFolderOpen } from "solid-icons/bi"
import { TbX, TbCheck, TbCopy, TbFileArrowRight } from "solid-icons/tb"
import { CgRename, CgFolderAdd } from "solid-icons/cg"
import { AiTwotoneDelete } from "solid-icons/ai"
import { Menu, Item, useContextMenu } from "solid-contextmenu"
import "solid-contextmenu/dist/style.css"
import {
  Accessor,
  createContext,
  createSignal,
  useContext,
  Show,
  For,
  Setter,
  createEffect,
  on,
  JSXElement,
  onMount,
  onCleanup,
} from "solid-js"
import { useFetch, useT, useUtil } from "~/hooks"
import { getMainColor, password } from "~/store"
import { Obj } from "~/types"
import {
  pathBase,
  pathDir,
  handleResp,
  handleRespWithNotifySuccess,
  hoverColor,
  pathJoin,
  fsDirs,
  createMatcher,
  fsMkdir,
  fsRename,
  fsMove,
  fsCopy,
  fsRemove,
  validateFilename,
  notify,
} from "~/utils"

// Dedicated context-menu id for the folder tree, kept separate from the main
// file list's menu (id 1 in pages/home/folder/context-menu.tsx) so the two
// don't collide.
const FOLDER_TREE_MENU_ID = 2

export type FolderTreeHandler = {
  setPath: Setter<string>
  startCreateFolder: () => void
}
export interface FolderTreeProps {
  onChange: (path: string) => void
  forceRoot?: boolean
  autoOpen?: boolean
  handle?: (handler: FolderTreeHandler) => void
  showEmptyIcon?: boolean
  showHiddenFolder?: boolean
  // Right-click menu (rename / move / copy / delete / new folder) on each node.
  enableActions?: boolean
  // Drag a folder onto another folder to copy it there.
  enableDragCopy?: boolean
}
interface FolderTreeContext extends Omit<FolderTreeProps, "handle"> {
  value: Accessor<string>
  creatingFolderPath: Accessor<string | null>
  setCreatingFolderPath: Setter<string | null>
  // Per-path reload registry: each mounted node registers a forced-reload fn so
  // an action elsewhere (delete/rename/copy/move) can refresh the affected node.
  registerReload: (path: string, reload: () => void) => void
  unregisterReload: (path: string) => void
  reloadPath: (path: string) => void
  // Drop-target highlight while dragging.
  dragOverPath: Accessor<string | null>
  setDragOverPath: Setter<string | null>
  // Action requests, routed to the modals hosted by the root FolderTree.
  requestRename: (path: string) => void
  requestDelete: (path: string) => void
  requestMove: (path: string) => void
  requestCopy: (path: string) => void
  requestMkdir: (path: string) => void
  // Copy a dragged folder into a drop-target folder.
  dropCopy: (draggedPath: string, dstPath: string) => void
}
const context = createContext<FolderTreeContext>()
export const FolderTree = (props: FolderTreeProps) => {
  const t = useT()
  const { colorMode } = useColorMode()
  const [path, setPath] = createSignal("/")
  const [creatingFolderPath, setCreatingFolderPath] = createSignal<
    string | null
  >(null)
  const [dragOverPath, setDragOverPath] = createSignal<string | null>(null)

  const startCreateFolder = () => {
    setCreatingFolderPath(path())
  }

  props.handle?.({
    setPath,
    startCreateFolder,
  })

  // Reload registry (plain map of callbacks — no reactivity needed).
  const reloadMap = new Map<string, () => void>()
  const registerReload = (p: string, reload: () => void) =>
    reloadMap.set(p, reload)
  const unregisterReload = (p: string) => reloadMap.delete(p)
  const reloadPath = (p: string) => reloadMap.get(p)?.()

  // Action modal targets (null = closed).
  const [renameTarget, setRenameTarget] = createSignal<string | null>(null)
  const [renameName, setRenameName] = createSignal("")
  const [deleteTarget, setDeleteTarget] = createSignal<string | null>(null)
  const [moveTarget, setMoveTarget] = createSignal<string | null>(null)
  const [copyTarget, setCopyTarget] = createSignal<string | null>(null)

  const [renaming, doRename] = useFetch(fsRename)
  const [deleting, doDelete] = useFetch(fsRemove)
  const [moving, doMove] = useFetch(fsMove)
  const [copying, doCopy] = useFetch(fsCopy)

  const requestRename = (p: string) => {
    setRenameName(pathBase(p) ?? "")
    setRenameTarget(p)
  }
  const requestDelete = (p: string) => setDeleteTarget(p)
  const requestMove = (p: string) => setMoveTarget(p)
  const requestCopy = (p: string) => setCopyTarget(p)
  const requestMkdir = (p: string) => setCreatingFolderPath(p)

  const submitRename = async () => {
    const target = renameTarget()
    if (!target) return
    const name = renameName().trim()
    if (!name) return
    const validation = validateFilename(name)
    if (!validation.valid) {
      notify.warning(t(`global.${validation.error}`))
      return
    }
    const resp = await doRename(target, name, false)
    handleRespWithNotifySuccess(resp, () => {
      reloadPath(pathDir(target))
      setRenameTarget(null)
    })
  }

  const submitDelete = async () => {
    const target = deleteTarget()
    if (!target) return
    const resp = await doDelete(pathDir(target), [pathBase(target)])
    handleRespWithNotifySuccess(resp, () => {
      reloadPath(pathDir(target))
      setDeleteTarget(null)
    })
  }

  // Copy a dragged folder into a drop target, guarding against no-op / illegal
  // drops (onto itself, into a descendant, or back into its own parent).
  const dropCopy = async (draggedPath: string, dstPath: string) => {
    if (dstPath === draggedPath || dstPath.startsWith(draggedPath + "/")) {
      notify.warning(t("home.tree.cannot_drop_into_self"))
      return
    }
    const src = pathDir(draggedPath)
    if (src === dstPath) {
      notify.warning(t("home.tree.already_in_folder"))
      return
    }
    const resp = await doCopy(
      src,
      dstPath,
      [pathBase(draggedPath)],
      false,
      false,
      false,
    )
    handleRespWithNotifySuccess(resp, () => {
      reloadPath(dstPath)
    })
  }

  return (
    <Box class="folder-tree-box" w="$full" overflowX="auto">
      <context.Provider
        value={{
          value: path,
          onChange: (val) => {
            setPath(val)
            props.onChange(val)
          },
          autoOpen: props.autoOpen ?? false,
          forceRoot: props.forceRoot ?? false,
          showEmptyIcon: props.showEmptyIcon ?? false,
          showHiddenFolder: props.showHiddenFolder ?? true,
          enableActions: props.enableActions ?? false,
          enableDragCopy: props.enableDragCopy ?? false,
          creatingFolderPath,
          setCreatingFolderPath,
          registerReload,
          unregisterReload,
          reloadPath,
          dragOverPath,
          setDragOverPath,
          requestRename,
          requestDelete,
          requestMove,
          requestCopy,
          requestMkdir,
          dropCopy,
        }}
      >
        <FolderTreeNode path="/" />
      </context.Provider>
      <Show when={props.enableActions}>
        <Menu
          id={FOLDER_TREE_MENU_ID}
          animation="scale"
          theme={colorMode() !== "dark" ? "light" : "dark"}
          style="z-index: var(--hope-zIndices-popover)"
        >
          <Item
            hidden={({ props }) => props.path === "/"}
            onClick={({ props }) => requestRename(props.path)}
          >
            <HStack spacing="$2">
              <Icon as={CgRename} boxSize="$6" color="$accent9" />
              <Text>{t("home.toolbar.rename")}</Text>
            </HStack>
          </Item>
          <Item
            hidden={({ props }) => props.path === "/"}
            onClick={({ props }) => requestMove(props.path)}
          >
            <HStack spacing="$2">
              <Icon as={TbFileArrowRight} boxSize="$6" color="$warning9" />
              <Text>{t("home.toolbar.move")}</Text>
            </HStack>
          </Item>
          <Item
            hidden={({ props }) => props.path === "/"}
            onClick={({ props }) => requestCopy(props.path)}
          >
            <HStack spacing="$2">
              <Icon as={TbCopy} boxSize="$6" color="$success9" />
              <Text>{t("home.toolbar.copy")}</Text>
            </HStack>
          </Item>
          <Item onClick={({ props }) => requestMkdir(props.path)}>
            <HStack spacing="$2">
              <Icon as={CgFolderAdd} boxSize="$6" p="$1" />
              <Text>{t("home.toolbar.mkdir")}</Text>
            </HStack>
          </Item>
          <Item
            hidden={({ props }) => props.path === "/"}
            onClick={({ props }) => requestDelete(props.path)}
          >
            <HStack spacing="$2">
              <Icon as={AiTwotoneDelete} boxSize="$6" color="$danger9" />
              <Text>{t("home.toolbar.delete")}</Text>
            </HStack>
          </Item>
        </Menu>
        {/* Rename modal */}
        <Modal
          blockScrollOnMount={false}
          opened={renameTarget() !== null}
          onClose={() => setRenameTarget(null)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{t("home.toolbar.rename")}</ModalHeader>
            <ModalBody>
              <Input
                value={renameName()}
                onInput={(e) => setRenameName(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    submitRename()
                  }
                }}
              />
            </ModalBody>
            <ModalFooter display="flex" gap="$2">
              <Button
                onClick={() => setRenameTarget(null)}
                colorScheme="neutral"
              >
                {t("global.cancel")}
              </Button>
              <Button loading={renaming()} onClick={submitRename}>
                {t("global.ok")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        {/* Delete confirm modal */}
        <Modal
          blockScrollOnMount={false}
          opened={deleteTarget() !== null}
          onClose={() => setDeleteTarget(null)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{t("home.toolbar.delete")}</ModalHeader>
            <ModalBody>
              <p>{t("home.toolbar.delete-tips")}</p>
            </ModalBody>
            <ModalFooter display="flex" gap="$2">
              <Button
                onClick={() => setDeleteTarget(null)}
                colorScheme="neutral"
              >
                {t("global.cancel")}
              </Button>
              <Button
                colorScheme="danger"
                loading={deleting()}
                onClick={submitDelete}
              >
                {t("global.confirm")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        {/* Move destination chooser */}
        <ModalFolderChoose
          header={t("home.toolbar.choose_dst_folder")}
          opened={moveTarget() !== null}
          onClose={() => setMoveTarget(null)}
          loading={moving()}
          onSubmit={async (dst) => {
            const target = moveTarget()
            if (!target) return
            const resp = await doMove(
              pathDir(target),
              dst,
              [pathBase(target)],
              false,
              false,
            )
            handleRespWithNotifySuccess(resp, () => {
              reloadPath(pathDir(target))
              reloadPath(dst)
              setMoveTarget(null)
            })
          }}
        />
        {/* Copy destination chooser */}
        <ModalFolderChoose
          header={t("home.toolbar.choose_dst_folder")}
          opened={copyTarget() !== null}
          onClose={() => setCopyTarget(null)}
          loading={copying()}
          onSubmit={async (dst) => {
            const target = copyTarget()
            if (!target) return
            const resp = await doCopy(
              pathDir(target),
              dst,
              [pathBase(target)],
              false,
              false,
              false,
            )
            handleRespWithNotifySuccess(resp, () => {
              reloadPath(dst)
              setCopyTarget(null)
            })
          }}
        />
      </Show>
    </Box>
  )
}

const FolderTreeNode = (props: { path: string }) => {
  const { isHidePath } = useUtil()
  const [children, setChildren] = createSignal<Obj[]>()
  const {
    value,
    onChange,
    forceRoot,
    autoOpen,
    showEmptyIcon,
    showHiddenFolder,
    creatingFolderPath,
    setCreatingFolderPath,
    enableActions,
    enableDragCopy,
    registerReload,
    unregisterReload,
    dragOverPath,
    setDragOverPath,
    dropCopy,
  } = useContext(context)!
  const emptyIconVisible = () =>
    Boolean(showEmptyIcon && children() !== undefined && !children()?.length)
  const [loading, fetchDirs] = useFetch(() =>
    fsDirs(props.path, password(), forceRoot),
  )
  let isLoaded = false
  const load = async (force = false) => {
    if (!force && children()?.length) return
    const resp = await fetchDirs() // this api may return null
    handleResp(
      resp,
      (data) => {
        isLoaded = true
        setChildren(data)
      },
      () => {
        if (isOpen()) onToggle() // close folder while failed
      },
    )
  }
  // Expose a forced reload so actions elsewhere can refresh this node.
  onMount(() => registerReload(props.path, () => load(true)))
  onCleanup(() => unregisterReload(props.path))
  const { show } = useContextMenu({ id: FOLDER_TREE_MENU_ID })
  const isDropTarget = () => enableDragCopy && dragOverPath() === props.path
  const { isOpen, onToggle } = createDisclosure()
  const active = () => value() === props.path
  const isMatchedFolder = createMatcher(props.path)
  const checkIfShouldOpen = async (pathname: string) => {
    if (!autoOpen) return
    if (isMatchedFolder(pathname)) {
      if (!isOpen()) onToggle()
      if (!isLoaded) load()
    }
  }
  createEffect(on(value, checkIfShouldOpen))

  createEffect(() => {
    if (creatingFolderPath() === props.path) {
      if (!isOpen()) onToggle()
      if (!isLoaded) load()
    }
  })

  const isHiddenFolder = () =>
    isHidePath(props.path) && !isMatchedFolder(value())
  return (
    <Show when={showHiddenFolder || !isHiddenFolder()}>
      <Box>
        <HStack
          spacing="$2"
          rounded="$md"
          bgColor={isDropTarget() ? "$info4" : "transparent"}
          outline={isDropTarget() ? "2px dashed $info9" : undefined}
          draggable={enableDragCopy && props.path !== "/"}
          onDragStart={(e) => {
            if (!enableDragCopy) return
            e.dataTransfer?.setData("text/openlist-path", props.path)
            if (e.dataTransfer) e.dataTransfer.effectAllowed = "copy"
          }}
          onDragOver={(e) => {
            if (!enableDragCopy) return
            e.preventDefault()
            if (e.dataTransfer) e.dataTransfer.dropEffect = "copy"
            setDragOverPath(props.path)
          }}
          onDragLeave={() => {
            if (dragOverPath() === props.path) setDragOverPath(null)
          }}
          onDrop={(e) => {
            if (!enableDragCopy) return
            e.preventDefault()
            const dragged = e.dataTransfer?.getData("text/openlist-path")
            setDragOverPath(null)
            if (dragged) {
              dropCopy(dragged, props.path)
              if (!isOpen()) {
                onToggle()
                load()
              }
            }
          }}
          onContextMenu={(e) => {
            if (enableActions) show(e, { props: { path: props.path } })
          }}
        >
          <Show
            when={!loading()}
            fallback={<Spinner size="sm" color={getMainColor()} />}
          >
            <Show
              when={!emptyIconVisible()}
              fallback={<Icon color={getMainColor()} as={BiSolidFolderOpen} />}
            >
              <Icon
                color={getMainColor()}
                as={BiSolidRightArrow}
                transform={isOpen() ? "rotate(90deg)" : "none"}
                transition="transform 0.2s"
                cursor="pointer"
                onClick={() => {
                  onToggle()
                  if (isOpen()) {
                    load()
                  }
                }}
              />
            </Show>
          </Show>
          <Text
            css={{
              // textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            // overflow="hidden"
            fontSize="$md"
            cursor="pointer"
            px="$1"
            rounded="$md"
            bgColor={active() ? "$info8" : "transparent"}
            _hover={{
              bgColor: active() ? "$info8" : hoverColor(),
            }}
            onClick={() => {
              onChange(props.path)
            }}
          >
            {props.path === "/" ? "root" : pathBase(props.path)}
          </Text>
        </HStack>
        <Show when={isOpen()}>
          <VStack mt="$1" pl="$4" alignItems="start" spacing="$1">
            <For each={children()}>
              {(item) => (
                <FolderTreeNode path={pathJoin(props.path, item.name)} />
              )}
            </For>
            <Show when={creatingFolderPath() === props.path}>
              <FolderNameInput
                parentPath={props.path}
                onCancel={() => setCreatingFolderPath(null)}
                onSuccess={(fullPath) => {
                  setCreatingFolderPath(null)
                  onChange(fullPath)
                  load(true)
                }}
              />
            </Show>
          </VStack>
        </Show>
      </Box>
    </Show>
  )
}

const FOCUS_DELAY_MS = 0 // allow DOM to mount before focusing

const FolderNameInput = (props: {
  parentPath: string
  onCancel: () => void
  onSuccess: (fullPath: string) => void
}) => {
  const t = useT()
  const [folderName, setFolderName] = createSignal("")
  const [loading, mkdir] = useFetch(fsMkdir)

  const handleSubmit = async () => {
    const name = folderName().trim()
    if (!name || loading()) return

    const validation = validateFilename(name)
    if (!validation.valid) {
      notify.warning(t(`global.${validation.error}`))
      return
    }

    const fullPath = pathJoin(props.parentPath, name)
    const resp = await mkdir(fullPath)
    handleRespWithNotifySuccess(
      resp,
      () => {
        props.onSuccess(fullPath)
      },
      () => {
        props.onCancel()
      },
    )
  }

  let inputRef: HTMLInputElement | undefined

  onMount(() => {
    setTimeout(() => {
      inputRef?.focus()
      inputRef?.select()
    }, FOCUS_DELAY_MS)
  })

  return (
    <HStack spacing="$2" w="$full" pl="$4" alignItems="center">
      <Icon color={getMainColor()} as={BiSolidFolderOpen} />
      <Input
        ref={(el) => (inputRef = el)}
        value={folderName()}
        onInput={(e) => setFolderName(e.currentTarget.value)}
        placeholder={t("home.toolbar.input_dir_name")}
        size="sm"
        flex="1"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            handleSubmit()
          } else if (e.key === "Escape") {
            props.onCancel()
          }
        }}
        onBlur={(e) => {
          if (loading()) return
          const next = e.relatedTarget as HTMLElement | null
          if (next?.dataset.folderAction === "true") return
          if (!folderName().trim()) {
            props.onCancel()
          }
        }}
      />
      <Show
        when={!loading()}
        fallback={<Spinner size="sm" color={getMainColor()} />}
      >
        <Button
          aria-label={t("global.ok")}
          size="sm"
          variant="ghost"
          rounded="$md"
          p="$1"
          color="$success9"
          onClick={handleSubmit}
          tabIndex={0}
          data-folder-action="true"
        >
          <Icon as={TbCheck} boxSize="$6" />
        </Button>
      </Show>
      <Button
        aria-label={t("global.cancel")}
        size="sm"
        variant="ghost"
        rounded="$md"
        p="$1"
        color="$danger9"
        onClick={props.onCancel}
        tabIndex={0}
        data-folder-action="true"
      >
        <Icon as={TbX} boxSize="$6" />
      </Button>
    </HStack>
  )
}

export type ModalFolderChooseProps = {
  opened: boolean
  onClose: () => void
  onSubmit?: (text: string) => void
  type?: string
  defaultValue?: string | (() => string)
  loading?: boolean
  footerSlot?: JSXElement
  headerSlot?: (handler: FolderTreeHandler | undefined) => JSXElement
  children?: JSXElement
  header: string
}
export const ModalFolderChoose = (props: ModalFolderChooseProps) => {
  const t = useT()
  const [value, setValue] = createSignal("/")
  const [handler, setHandler] = createSignal<FolderTreeHandler>()
  createEffect(() => {
    if (!props.opened) return
    handler()?.setPath(value())
  })
  if (typeof props.defaultValue === "function") {
    createEffect(() => {
      setValue((props.defaultValue as () => string)())
    })
  } else if (typeof props.defaultValue === "string") {
    setValue(props.defaultValue)
  }
  return (
    <Modal
      size="xl"
      blockScrollOnMount={false}
      opened={props.opened}
      onClose={props.onClose}
    >
      <ModalOverlay />
      <ModalContent>
        {/* <ModalCloseButton /> */}
        <ModalHeader w="$full" css={{ overflowWrap: "break-word" }}>
          <HStack w="$full" justifyContent="space-between" alignItems="center">
            <Box css={{ overflowWrap: "break-word" }}>{props.header}</Box>
            <Show when={props.headerSlot && handler()}>
              {props.headerSlot!(handler()!)}
            </Show>
          </HStack>
        </ModalHeader>
        <ModalBody>
          {props.children}
          <FolderTree
            onChange={setValue}
            handle={(h) => setHandler(h)}
            autoOpen
          />
        </ModalBody>
        <ModalFooter
          display="flex"
          w="$full"
          gap="$4"
          alignItems="flex-end"
          justifyContent="flex-end"
        >
          <Show when={props.footerSlot}>
            <Box mr="auto">{props.footerSlot}</Box>
          </Show>
          <HStack spacing="$2">
            <Button onClick={props.onClose} colorScheme="neutral">
              {t("global.cancel")}
            </Button>
            <Button
              loading={props.loading}
              onClick={() => props.onSubmit?.(value())}
            >
              {t("global.ok")}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export const FolderChooseInput = (props: {
  value: string
  onChange: (path: string) => void
  id?: string
  onlyFolder?: boolean
}) => {
  const { isOpen, onOpen, onClose } = createDisclosure()
  const t = useT()
  return (
    <>
      <HStack w="$full" spacing="$2">
        <Input
          id={props.id}
          value={props.value}
          onInput={(e) => props.onChange(e.currentTarget.value)}
          readOnly={props.onlyFolder}
          onClick={props.onlyFolder ? onOpen : () => {}}
          placeholder={t(
            `global.${
              props.onlyFolder ? "choose_folder" : "choose_or_input_path"
            }`,
          )}
        />
        <Show when={!props.onlyFolder}>
          <Button onClick={onOpen}>{t("global.choose")}</Button>
        </Show>
      </HStack>
      <Modal size="xl" opened={isOpen()} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>{t("global.choose_folder")}</ModalHeader>
          <ModalBody>
            <FolderTree forceRoot onChange={props.onChange} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>{t("global.confirm")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
