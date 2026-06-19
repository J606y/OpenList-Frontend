import { Box, Grid, Text } from "@hope-ui/solid"
import { For, Show } from "solid-js"
import { GridItem } from "./GridItem"
import "lightgallery/css/lightgallery-bundle.css"
import { smartCountMsg, local, objStore } from "~/store"
import { useSelectWithMouse } from "./helper"

const GridLayout = () => {
  const { registerSelectContainer, captureContentMenu } = useSelectWithMouse()
  registerSelectContainer()
  return (
    <>
      <Show when={local["show_count_msg"] === "visible"}>
        <Box w="100%" textAlign="left" pl="$2">
          <Text size="sm" color="$neutral11">
            {smartCountMsg()}
          </Text>
        </Box>
      </Show>
      <Grid
        oncapture:contextmenu={captureContentMenu}
        class="viselect-container"
        w="$full"
        gap="$2"
        // Fewer columns on phones so tiles don't shrink to thumbnails: 3 on a
        // phone, 4 on large phones, the original 5 from @md up (where the
        // sidebars frame a narrower center column anyway).
        templateColumns={{
          "@initial": "repeat(3, 1fr)",
          "@sm": "repeat(4, 1fr)",
          "@md": "repeat(5, 1fr)",
        }}
      >
        <For each={objStore.objs}>
          {(obj, i) => {
            return <GridItem obj={obj} index={i()} />
          }}
        </For>
      </Grid>
    </>
  )
}

export default GridLayout
