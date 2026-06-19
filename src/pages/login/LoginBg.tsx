import { Box, useColorModeValue } from "@hope-ui/solid"
import CornerBottom from "./CornerBottom"
import CornerTop from "./CornerTop"

const LoginBg = () => {
  const bgImage = useColorModeValue(
    "linear-gradient(135deg, #ffd1e8 0%, #f7a8c4 50%, #ffe9f1 100%)",
    "linear-gradient(135deg, #0b1220 0%, #1e293b 50%, #0f172a 100%)",
  )
  // decorative corner blobs: rose in light mode, slate blue-gray in dark mode
  const cornerStart = useColorModeValue("#ffadd2", "#334155")
  const cornerEnd = useColorModeValue("#e84c9a", "#1e293b")
  return (
    <Box
      css={{ background: bgImage() }}
      pos="fixed"
      top="0"
      left="0"
      overflow="hidden"
      zIndex="-1"
      w="100vw"
      h="100vh"
    >
      <Box
        pos="absolute"
        right={{
          "@initial": "-100px",
          "@sm": "-300px",
        }}
        top={{
          "@initial": "-1170px",
          "@sm": "-900px",
        }}
      >
        <CornerTop startColor={cornerStart()} endColor={cornerEnd()} />
      </Box>
      <Box
        pos="absolute"
        left={{
          "@initial": "-100px",
          "@sm": "-200px",
        }}
        bottom={{
          "@initial": "-760px",
          "@sm": "-400px",
        }}
      >
        <CornerBottom startColor={cornerStart()} endColor={cornerEnd()} />
      </Box>
    </Box>
  )
}

export default LoginBg
