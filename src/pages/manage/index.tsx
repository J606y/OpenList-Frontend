import { Box, Flex } from "@hope-ui/solid"
import { useT, useTitle } from "~/hooks"
import { glassSidebarCss } from "~/utils"
import { Header } from "./Header"
import { SideMenu } from "./SideMenu"
import { side_menu_items } from "./sidemenu_items"
import { Route, Routes } from "@solidjs/router"
import { For } from "solid-js"
import { routes } from "./routes"

const Manage = () => {
  const t = useT()
  useTitle(() => t("manage.title"))
  return (
    <Box bgColor="$background" w="$full">
      <Header />
      <Flex w="$full" h="calc(100vh - 64px)">
        <Box
          display={{ "@initial": "none", "@sm": "block" }}
          w="$56"
          h="$full"
          overflowY="auto"
          css={glassSidebarCss}
        >
          <SideMenu items={side_menu_items} />
        </Box>
        <Box
          w={{
            "@initial": "$full",
            "@sm": "calc(100% - 14rem)",
          }}
          p="$4"
          overflowY="auto"
        >
          <Routes>
            <For each={routes}>
              {(route) => {
                return <Route path={route.to!} component={route.component} />
              }}
            </For>
          </Routes>
        </Box>
      </Flex>
    </Box>
  )
}

export default Manage
