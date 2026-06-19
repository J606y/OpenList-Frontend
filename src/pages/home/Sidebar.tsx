import { Box, Heading } from "@hope-ui/solid"
import { createEffect, createSignal, untrack } from "solid-js"
import { FolderTree, FolderTreeHandler } from "~/components"
import { useRouter, useT } from "~/hooks"
import { objStore, State } from "~/store"
import { glassSurfaceCss, pathDir } from "~/utils"

// Sidebar width and visibility, shared with Body's spacer so the centered
// content stays at the true viewport center (not just centered in the
// space left of the sidebar). Hidden on narrow/mobile screens.
export const SIDEBAR_WIDTH = { "@md": "300px", "@xl": "340px" }
export const SIDEBAR_DISPLAY = { "@initial": "none", "@md": "block" }

// Shared sizing for the three home cards (folder tree | file list | tools) so
// they render as equal-height, viewport-tall panels that each scroll on their
// own. The small top inset keeps them off the very top edge; the matching
// bottom inset is baked into the height calc (top + bottom = 1rem).
export const BODY_CARD_TOP = "$2"
// `dvh` (dynamic viewport height) so the file-list panel isn't clipped behind a
// mobile browser's collapsing address bar; on desktop it equals `vh`.
export const BODY_CARD_HEIGHT = "calc(100dvh - 1rem)"

// Windows-Explorer-like folder tree: a persistent panel pinned to the left.
// Clicking a folder navigates the main content area on the right.
function SidebarPanel() {
  const { to, pathname } = useRouter()
  const t = useT()

  const [folderTreeHandler, setFolderTreeHandler] =
    createSignal<FolderTreeHandler>()

  // Keep the folder tree's highlight in sync with where the file list is.
  //
  // Driven off objStore.state (with pathname read untracked) rather than
  // pathname directly, so that:
  //   • opening a file (e.g. a video) at the bottom of the tree keeps its
  //     parent folder highlighted instead of clearing it — the file's own
  //     path matches no folder node;
  //   • the highlight never flashes off mid-navigation: we only push a path
  //     once the state settles to Folder/File, never the in-flight pathname
  //     (the Sidebar effect would otherwise run before the fetch starts and
  //     briefly point the tree at a not-yet-resolved path).
  //
  // pathname() is the router's decoded, base-trimmed path, so folders with
  // spaces / non-ASCII names still match the tree's decoded node paths.
  // Tracking folderTreeHandler() means the first sync also fires as soon as the
  // tree registers its handler.
  createEffect(() => {
    const handler = folderTreeHandler()
    const st = objStore.state
    if (!handler) return
    if (st === State.File) {
      handler.setPath(pathDir(untrack(pathname)) || "/")
    } else if (st === State.Folder || st === State.FetchingMore) {
      handler.setPath(untrack(pathname))
    }
    // Initial / fetching / need-password / error: keep the previous highlight.
  })

  return (
    <Box
      class="folder-tree-sidebar"
      display={SIDEBAR_DISPLAY}
      flexShrink={0}
      w={SIDEBAR_WIDTH}
      pos="sticky"
      top={BODY_CARD_TOP}
      h={BODY_CARD_HEIGHT}
      overflow="auto"
      p="$3"
      rounded="$xl"
      css={glassSurfaceCss}
    >
      <Heading size="sm" mb="$2" color="$neutral11">
        {t("manage.sidemenu.home")}
      </Heading>
      <FolderTree
        autoOpen
        showEmptyIcon
        showHiddenFolder={false}
        enableActions
        enableDragCopy
        onChange={(path) => to(path)}
        handle={(handler) => setFolderTreeHandler(handler)}
      />
    </Box>
  )
}

// Always shown as a persistent left panel (Windows-Explorer style); it is
// hidden only on narrow/mobile screens via the panel's responsive `display`.
export function Sidebar() {
  return <SidebarPanel />
}
