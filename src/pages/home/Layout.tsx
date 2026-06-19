import { Markdown } from "~/components"
import { useTitle } from "~/hooks"
import { getSetting } from "~/store"
import { notify } from "~/utils"
import { Body } from "./Body"
import { Footer } from "./Footer"
import { Header } from "./header/Header"
import { Toolbar } from "./toolbar/Toolbar"

const Index = () => {
  useTitle(getSetting("site_title"))
  const announcement = getSetting("announcement")
  if (announcement) {
    // Stable id de-dupes (no more stacked duplicates); persistent so it waits
    // for the user to close it instead of racing a 3s auto-dismiss timer.
    notify.render(<Markdown children={announcement} />, {
      id: "announcement",
      persistent: true,
    })
  }
  return (
    <>
      <Header />
      <Toolbar />
      <Body />
      <Footer />
    </>
  )
}

export default Index
