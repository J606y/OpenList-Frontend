import { Box, Center, Icon, createDisclosure, VStack } from "@hope-ui/solid"
import { createMemo, Show } from "solid-js"
import { RightIcon } from "./Icon"
import { CgMoreO } from "solid-icons/cg"
import { Motion } from "solid-motionone"
import { ToolbarButtons } from "./ToolbarButtons"
import { getMainColor } from "~/store"
import { glassButtonCss, glassSurfaceCss } from "~/utils"

// Floating bottom-right "more" menu. On desktop (md+) the right-side tools card
// (see Body's <RightCard/>) exposes the same actions, so this floating menu is
// hidden there to avoid redundancy; it stays available on narrow/mobile screens
// where the side columns are collapsed.
export const Right = () => {
  const { isOpen, onToggle } = createDisclosure({
    defaultIsOpen: localStorage.getItem("more-open") === "true",
    onClose: () => localStorage.setItem("more-open", "false"),
    onOpen: () => localStorage.setItem("more-open", "true"),
  })
  const margin = createMemo(() => (isOpen() ? "$4" : "$5"))
  return (
    <Box
      class="left-toolbar-box"
      display={{ "@initial": "block", "@md": "none" }}
      pos="fixed"
      right={margin()}
      bottom={margin()}
      zIndex="$sticky"
    >
      <Show
        when={isOpen()}
        fallback={
          <Center
            class="toolbar-toggle"
            as={Motion.div}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            // @ts-ignore
            transition={{ duration: 0.2 }}
            boxSize="52px"
            rounded="$full"
            cursor="pointer"
            color={getMainColor()}
            css={glassButtonCss}
            onClick={() => {
              onToggle()
            }}
          >
            <Icon as={CgMoreO} boxSize="$7" />
          </Center>
        }
      >
        <VStack
          class="left-toolbar"
          p="$2"
          rounded="$xl"
          spacing="$1"
          css={glassSurfaceCss}
          as={Motion.div}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          // @ts-ignore
          transition={{ duration: 0.2 }}
        >
          <VStack spacing="$1" class="left-toolbar-in">
            <ToolbarButtons />
          </VStack>
          <RightIcon tips="more" as={CgMoreO} onClick={onToggle} />
        </VStack>
      </Show>
    </Box>
  )
}
