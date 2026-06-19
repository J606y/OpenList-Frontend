import { createMemo, Show } from "solid-js"
import { RightIcon } from "./Icon"
import { TbCheckbox, TbLayoutDashboard } from "solid-icons/tb"
import {
  me,
  objStore,
  selectAll,
  State,
  toggleCheckbox,
  userCan,
} from "~/store"
import { bus } from "~/utils"
import { operations } from "./operations"
import { IoMagnetOutline } from "solid-icons/io"
import { AiOutlineCloudUpload, AiOutlineSetting } from "solid-icons/ai"
import { RiSystemRefreshLine } from "solid-icons/ri"
import { usePath, useRouter, useT } from "~/hooks"
import { isTocVisible, setTocDisabled } from "~/components"
import { BiSolidBookContent } from "solid-icons/bi"
import { UserMethods } from "~/types"

// The set of folder/file actions previously living only inside the floating
// bottom-right "more" menu. Extracted so the same permission-gated buttons can
// be rendered both there (mobile) and in the right-side tools card (desktop)
// without duplicating the conditions. Each button just emits on the bus; the
// matching modal is mounted once in Toolbar's <Modal/>, so the trigger location
// doesn't matter.
export const ToolbarButtons = () => {
  const t = useT()
  const isFolder = createMemo(() => objStore.state === State.Folder)
  const { refresh } = usePath()
  const { isShare, to } = useRouter()
  return (
    <>
      <Show
        when={
          isFolder() &&
          !isShare() &&
          (userCan("write_content") || objStore.write_content_bypass) &&
          objStore.write
        }
      >
        <RightIcon
          as={RiSystemRefreshLine}
          tips="refresh"
          onClick={() => {
            refresh(undefined, true)
          }}
        />
        <RightIcon
          as={operations.new_file.icon}
          tips="new_file"
          onClick={() => {
            bus.emit("tool", "new_file")
          }}
        />
        <RightIcon
          as={operations.mkdir.icon}
          p="$1_5"
          tips="mkdir"
          onClick={() => {
            bus.emit("tool", "mkdir")
          }}
        />
      </Show>
      <Show
        when={isFolder() && !isShare() && userCan("move") && objStore.write}
      >
        <RightIcon
          as={operations.recursive_move.icon}
          tips="recursive_move"
          onClick={() => {
            bus.emit("tool", "recursiveMove")
          }}
        />
      </Show>
      <Show
        when={isFolder() && !isShare() && userCan("delete") && objStore.write}
      >
        <RightIcon
          as={operations.remove_empty_directory.icon}
          tips="remove_empty_directory"
          onClick={() => {
            bus.emit("tool", "removeEmptyDirectory")
          }}
        />
      </Show>
      <Show
        when={isFolder() && !isShare() && userCan("rename") && objStore.write}
      >
        <RightIcon
          as={operations.batch_rename.icon}
          tips="batch_rename"
          onClick={() => {
            selectAll(true)
            bus.emit("tool", "batchRename")
          }}
        />
      </Show>
      <Show
        when={
          isFolder() &&
          !isShare() &&
          (userCan("write_content") || objStore.write_content_bypass) &&
          objStore.write
        }
      >
        <RightIcon
          as={AiOutlineCloudUpload}
          tips="upload"
          onClick={() => {
            bus.emit("tool", "upload")
          }}
        />
      </Show>
      <Show
        when={
          isFolder() &&
          !isShare() &&
          userCan("offline_download") &&
          objStore.write
        }
      >
        <RightIcon
          as={IoMagnetOutline}
          pl="0"
          tips="offline_download"
          onClick={() => {
            bus.emit("tool", "offline_download")
          }}
        />
      </Show>
      <Show when={isTocVisible()}>
        <RightIcon
          as={BiSolidBookContent}
          tips="toggle_markdown_toc"
          onClick={() => {
            setTocDisabled((disabled) => !disabled)
          }}
        />
      </Show>
      <RightIcon
        tips="toggle_checkbox"
        as={TbCheckbox}
        onClick={toggleCheckbox}
      />
      <RightIcon
        as={TbLayoutDashboard}
        tips="local_settings"
        onClick={() => {
          bus.emit("tool", "local_settings")
        }}
      />
      {/* Admin console entry, moved here from the page footer. */}
      <Show when={!UserMethods.is_guest(me())}>
        <RightIcon
          as={AiOutlineSetting}
          label={t("home.footer.manage")}
          onClick={() => {
            to("/@manage")
          }}
        />
      </Show>
    </>
  )
}
