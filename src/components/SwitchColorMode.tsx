import {
  Icon,
  IconButton,
  useColorMode,
  useColorModeValue,
} from "@hope-ui/solid"
// import { IoMoonOutline as Moon } from "solid-icons/io";
import { FiSun as Sun } from "solid-icons/fi"
import { FiMoon as Moon } from "solid-icons/fi"

// `asButton` renders the toggle as a rounded (liquid-glass) IconButton so it
// matches the surrounding buttons (e.g. the admin header). Without it, a bare
// icon is rendered for icon rows (login / home toolbars).
const SwitchColorMode = (props: { asButton?: boolean }) => {
  const { toggleColorMode } = useColorMode()
  const icon = useColorModeValue(
    {
      size: "$8",
      component: Moon,
      p: "$0_5",
    },
    {
      size: "$8",
      component: Sun,
      p: "$0_5",
    },
  )
  if (props.asButton) {
    return (
      <IconButton
        aria-label="switch color mode"
        size="sm"
        icon={<Icon as={icon().component} />}
        onClick={toggleColorMode}
      />
    )
  }
  return (
    <Icon
      cursor="pointer"
      boxSize={icon().size}
      as={icon().component}
      onClick={toggleColorMode}
      p={icon().p}
    />
  )
}
export { SwitchColorMode }
