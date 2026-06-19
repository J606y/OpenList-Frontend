import { Text, VStack, Button } from "@hope-ui/solid"
import {
  createEffect,
  createMemo,
  createSignal,
  lazy,
  Match,
  on,
  Show,
  Suspense,
  Switch,
} from "solid-js"
import { Error, FullLoading, LinkWithBase } from "~/components"
import { useObjTitle, usePath, useRouter, useT } from "~/hooks"
import {
  getPagination,
  objStore,
  password,
  recordHistory,
  setPassword,
  /*layout,*/ State,
  me,
} from "~/store"
import { UserMethods } from "~/types"
import { glassSurfaceCss } from "~/utils"
import { BODY_CARD_TOP, BODY_CARD_HEIGHT } from "./Sidebar"
import { Box } from "@hope-ui/solid"
import { Nav } from "./Nav"

const Folder = lazy(() => import("./folder/Folder"))
const File = lazy(() => import("./file/File"))
const Password = lazy(() => import("./Password"))
// const ListSkeleton = lazy(() => import("./Folder/ListSkeleton"));
// const GridSkeleton = lazy(() => import("./Folder/GridSkeleton"));

const [objBoxRef, setObjBoxRef] = createSignal<HTMLDivElement>()
export { objBoxRef }

export const Obj = () => {
  const t = useT()
  const { pathname, searchParams, isShare, to } = useRouter()
  const { handlePathChange, refresh } = usePath()
  const pagination = getPagination()
  const page = createMemo(() => {
    return pagination.type === "pagination"
      ? parseInt(searchParams["page"], 10) || 1
      : undefined
  })
  let lastPathname: string
  let lastPage: number | undefined
  createEffect(
    on([pathname, page], async ([pathname, page]) => {
      if (searchParams["pwd"]) {
        setPassword(searchParams["pwd"])
      }
      if (lastPathname) {
        recordHistory(lastPathname, lastPage)
      }
      lastPathname = pathname
      lastPage = page
      useObjTitle()
      await handlePathChange(pathname, page)
    }),
  )

  const isStorageError = createMemo(() => {
    const err = objStore.err
    return (
      err.includes("storage not found") || err.includes("please add a storage")
    )
  })

  const shouldShowStorageButton = createMemo(() => {
    return isStorageError() && UserMethods.is_admin(me())
  })

  const storageErrorActions = () => (
    <Button colorScheme="accent" onClick={() => to("/@manage/storages")}>
      {t("global.go_to_storages")}
    </Button>
  )
  return (
    <VStack
      ref={(el: HTMLDivElement) => setObjBoxRef(el)}
      class="obj-box"
      w="$full"
      pos="sticky"
      top={BODY_CARD_TOP}
      h={BODY_CARD_HEIGHT}
      overflow="auto"
      rounded="$xl"
      p="$2"
      spacing="$2"
      css={glassSurfaceCss}
    >
      {/* Mobile-only breadcrumb path. Desktop shows location via the folder-tree
          sidebar, which is hidden on phones — so the path is restored here as a
          frosted bar pinned to the top of the file-list card. */}
      <Box
        display={{ "@initial": "block", "@md": "none" }}
        w="$full"
        pos="sticky"
        top="0"
        zIndex="$docked"
        flexShrink={0}
        rounded="$lg"
        px="$2"
        py="$1"
        css={glassSurfaceCss}
      >
        <Nav background="transparent" />
      </Box>
      <Suspense fallback={<FullLoading />}>
        <Switch>
          <Match when={objStore.err}>
            <Error
              msg={objStore.err}
              disableColor
              actions={
                shouldShowStorageButton() ? storageErrorActions() : undefined
              }
            />
          </Match>
          <Match
            when={[State.FetchingObj, State.FetchingObjs].includes(
              objStore.state,
            )}
          >
            <FullLoading />
            {/* <Show when={layout() === "list"} fallback={<GridSkeleton />}>
              <ListSkeleton />
            </Show> */}
          </Match>
          <Match when={objStore.state === State.NeedPassword}>
            <Password
              title={
                isShare()
                  ? t("shares.input_password")
                  : t("home.input_password")
              }
              password={password}
              setPassword={setPassword}
              enterCallback={() => refresh(true)}
            >
              <Show when={!isShare()}>
                <Text>{t("global.have_account")}</Text>
                <Text
                  color="$info9"
                  as={LinkWithBase}
                  href={`/@login?redirect=${encodeURIComponent(
                    location.pathname,
                  )}`}
                >
                  {t("global.go_login")}
                </Text>
              </Show>
            </Password>
          </Match>
          <Match
            when={[State.Folder, State.FetchingMore].includes(objStore.state)}
          >
            <Folder />
          </Match>
          <Match when={objStore.state === State.File}>
            <File />
          </Match>
        </Switch>
      </Suspense>
    </VStack>
  )
}
