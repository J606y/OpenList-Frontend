import { HStack, Heading, Center, Icon, Kbd, CenterProps } from "@hope-ui/solid"
import { changeColor } from "seemly"
import { Show, createMemo } from "solid-js"
import { getMainColor, getSetting, local, objStore, State } from "~/store"
import { BsSearch } from "solid-icons/bs"
import { Container } from "../Container"
import { bus } from "~/utils"
import { isMac } from "~/utils/compatibility"

export const Header = () => {
  const stickyProps = createMemo<CenterProps>(() => {
    switch (local["position_of_header_navbar"]) {
      case "sticky":
        return { position: "sticky", zIndex: "$sticky", top: 0 }
      default:
        return { position: undefined, zIndex: undefined, top: undefined }
    }
  })

  return (
    <Center
      {...stickyProps}
      bgColor="$background"
      class="header"
      w="$full"
      // shadow="$md"
    >
      <Container>
        <HStack
          px="calc(2% + 0.5rem)"
          py="$2"
          w="$full"
          justifyContent="space-between"
        >
          <HStack class="header-left" h="44px" alignItems="center">
            <Heading
              class="liquid-glass-title"
              fontSize={{ "@initial": "$xl", "@md": "$2xl" }}
            >
              {getSetting("site_title")}
            </Heading>
          </HStack>
          <HStack class="header-right" spacing="$2">
            <Show when={objStore.state === State.Folder}>
              <Show when={getSetting("search_index") !== "none"}>
                <HStack
                  bg="$neutral4"
                  // Full pill with the keyboard hint on desktop; a compact
                  // icon-only button on phones (no physical keyboard there).
                  w={{ "@initial": "auto", "@md": "$32" }}
                  p="$1"
                  rounded="$md"
                  justifyContent={{
                    "@initial": "center",
                    "@md": "space-between",
                  }}
                  border="2px solid transparent"
                  cursor="pointer"
                  color={getMainColor()}
                  bgColor={changeColor(getMainColor(), { alpha: 0.15 })}
                  _hover={{
                    bgColor: changeColor(getMainColor(), { alpha: 0.2 }),
                  }}
                  onClick={() => {
                    bus.emit("tool", "search")
                  }}
                >
                  <Icon as={BsSearch} />
                  <HStack display={{ "@initial": "none", "@md": "flex" }}>
                    {isMac ? <Kbd>Cmd</Kbd> : <Kbd>Ctrl</Kbd>}
                    <Kbd>K</Kbd>
                  </HStack>
                </HStack>
              </Show>
            </Show>
          </HStack>
        </HStack>
      </Container>
    </Center>
  )
}
