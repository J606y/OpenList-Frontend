import { Box, Flex, VStack } from "@hope-ui/solid"
import { Obj } from "./Obj"
import { Readme } from "./Readme"
import { Container } from "./Container"
import {
  Sidebar,
  SIDEBAR_WIDTH,
  BODY_CARD_TOP,
  BODY_CARD_HEIGHT,
} from "./Sidebar"
import { RightCard } from "./RightCard"
import { VideoPlayerLinks } from "./previews/VideoPlayerLinks"

export const Body = () => {
  return (
    <Flex
      class="home-body"
      w="$full"
      alignItems="flex-start"
      gap="$2"
      px="$2"
      minH="80vh"
    >
      {/* Left: Windows-Explorer-like folder tree, pinned to the far left */}
      <Sidebar />
      {/* Center: the white area showing the current folder's contents */}
      <Box
        flex="1"
        minW="0"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Container>
          <VStack class="body" pb="$2" px="2%" w="$full" gap="$4">
            <Readme
              files={["header.md", "top.md", "index.md"]}
              fromMeta="header"
            />
            <Obj />
            <Readme
              files={["readme.md", "footer.md", "bottom.md"]}
              fromMeta="readme"
            />
          </VStack>
        </Container>
      </Box>
      {/* Right column: the tools card, and below it the video "open in app"
          card whenever a video is open. Same width as the sidebar so the center
          content stays truly centered. Hidden on mobile (the floating menu and
          the under-player card take over there). A sticky, viewport-tall flex
          column so it stays pinned while scrolling; the tools card wraps its
          buttons (see RightCard) rather than stretching to full height, with
          the video card sitting right beneath it. */}
      <Flex
        display={{ "@initial": "none", "@md": "flex" }}
        flexDirection="column"
        flexShrink={0}
        w={SIDEBAR_WIDTH}
        pos="sticky"
        top={BODY_CARD_TOP}
        h={BODY_CARD_HEIGHT}
        gap="$2"
      >
        <RightCard />
        <VideoPlayerLinks />
      </Flex>
    </Flex>
  )
}
