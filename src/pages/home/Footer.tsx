import { HStack, VStack } from "@hope-ui/solid"
import { Link } from "@solidjs/router"
import { Show } from "solid-js"
import { AnchorWithBase } from "~/components"
import { useT } from "~/hooks"
import { me } from "~/store"
import { UserMethods } from "~/types"

export const Footer = () => {
  const t = useT()
  // The "manage" entry moved into the right-side tools card (RightCard) for
  // logged-in users; the footer now only carries the guest login link.
  return (
    <Show when={UserMethods.is_guest(me())}>
      <VStack class="footer" w="$full" py="$4">
        <HStack spacing="$1">
          <AnchorWithBase as={Link} href="/@login">
            {t("login.login")}
          </AnchorWithBase>
        </HStack>
      </VStack>
    </Show>
  )
}
