import { Anchor, Box, Flex, Heading, Image, Tooltip } from "@hope-ui/solid"
import { For, Show } from "solid-js"
import { useLink, useT } from "~/hooks"
import { objStore } from "~/store"
import { ObjType } from "~/types"
import { convertURL, glassSurfaceCss } from "~/utils"
import { players } from "./players"

// The "open in other apps" external player links, as a glass card. Rendered in
// the home page's right column (below the tools card) on desktop, and under the
// player itself on mobile where that column is hidden. It reads the open file
// from the global objStore, so it works in either location and only shows when
// the current object is a video. All players are tiled flat (no show-all/expand
// toggle), so the card has a stable height.
export const VideoPlayerLinks = (props: {
  display?: Parameters<typeof Box>[0]["display"]
}) => {
  const t = useT()
  const { currentObjLink } = useLink()
  return (
    <Show when={objStore.obj?.type === ObjType.VIDEO}>
      <Box
        class="video-players-card"
        w="$full"
        p="$3"
        rounded="$xl"
        css={glassSurfaceCss}
        display={props.display}
      >
        <Heading size="sm" mb="$2" color="$neutral11" textAlign="center">
          {t("home.preview.play_with")}
        </Heading>
        <Flex
          wrap="wrap"
          gap="$2"
          justifyContent="flex-start"
          alignItems="center"
        >
          <For each={players}>
            {(item) => {
              return (
                <Tooltip placement="top" withArrow label={item.name}>
                  <Anchor
                    href={convertURL(item.scheme, {
                      raw_url: objStore.raw_url,
                      name: objStore.obj.name,
                      d_url: currentObjLink(true),
                    })}
                  >
                    <Image
                      m="0 auto"
                      boxSize="$8"
                      src={`${(window.__dynamic_base__ || "").replace(/\/+$/, "")}/images/${item.icon}.webp`}
                    />
                  </Anchor>
                </Tooltip>
              )
            }}
          </For>
        </Flex>
      </Box>
    </Show>
  )
}
