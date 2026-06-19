import { Box, Flex, Heading } from "@hope-ui/solid"
import { useT } from "~/hooks"
import { glassSurfaceCss } from "~/utils"
import { ToolbarButtons } from "./toolbar/ToolbarButtons"

// Right-side tools card: the folder/file actions previously only reachable via
// the floating bottom-right "more" menu. Rendered inside the Body's right
// column (see Body.tsx), which handles its width/visibility; here it's just the
// glass card itself.
export function RightCard() {
  const t = useT()
  return (
    <Box
      class="right-tools-card"
      w="$full"
      // Wrap the action buttons instead of stretching to the full column
      // height; cap at the viewport and scroll only if the buttons ever
      // overflow (the video "open in app" card sits right beneath it).
      maxH="$full"
      overflow="auto"
      p="$3"
      rounded="$xl"
      css={glassSurfaceCss}
    >
      <Heading size="sm" mb="$2" color="$neutral11">
        {t("home.toolbar.more")}
      </Heading>
      <Flex wrap="wrap" gap="$2">
        <ToolbarButtons />
      </Flex>
    </Box>
  )
}
