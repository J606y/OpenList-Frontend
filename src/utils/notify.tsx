import {
  Box,
  CloseButton,
  // Alert,
  // AlertDescription,
  // AlertIcon,
  // AlertTitle,
  // CloseButton,
  notificationService,
} from "@hope-ui/solid"
import { JSXElement } from "solid-js"
import { alphaBgColor, firstUpperCase } from "."

const notify = {
  render: (
    element: JSXElement,
    options?: { id?: string; persistent?: boolean; duration?: number },
  ) => {
    notificationService.show({
      // A stable id lets the service de-duplicate: calling show() again with the
      // same id is a no-op instead of stacking a second identical card (which is
      // why the announcement used to show twice and the close button "wouldn't
      // close it" — you closed the top one and the one behind appeared).
      id: options?.id,
      persistent: options?.persistent,
      duration: options?.duration,
      render: (props) => {
        return (
          <Box
            css={{
              display: "flex",
              alignItems: "flex-start",
              gap: "$2",
              backdropFilter: "blur(8px)",
              backgroundColor: alphaBgColor(),
              boxShadow: "$md",
              borderRadius: "$lg",
              padding: "$3",
            }}
          >
            {/* min-width:0 lets the content shrink/wrap instead of overflowing
                onto the close button and stealing its clicks. */}
            <Box
              css={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                overflowWrap: "anywhere",
              }}
            >
              <Box css={{ margin: "auto" }}>{element}</Box>
            </Box>
            <CloseButton
              flexShrink={0}
              size="sm"
              aria-label="close"
              onClick={props.close}
            />
          </Box>
        )
      },
    })
  },
  success: (message: string) => {
    notificationService.show({
      status: "success",
      title: firstUpperCase(message),
      // render: (props) => (
      //   <Alert status="success" shadow="$md">
      //     <AlertIcon mr="$2_5" />
      //     <AlertDescription mr="$2_5">{message}</AlertDescription>
      //     <CloseButton size="sm" onClick={props.close} />
      //   </Alert>
      // ),
    })
  },
  error: (message: string) => {
    notificationService.show({
      status: "danger",
      title: firstUpperCase(message),
      // render: (props) => (
      //   <Alert status="danger" shadow="$md">
      //     <AlertIcon mr="$2_5" />
      //     <AlertDescription mr="$2_5">{message}</AlertDescription>
      //     <CloseButton size="sm" onClick={props.close} />
      //   </Alert>
      // ),
    })
  },
  info: (message: string) => {
    notificationService.show({
      status: "info",
      title: firstUpperCase(message),
      // render: (props) => (
      //   <Alert status="info" shadow="$md">
      //     <AlertIcon mr="$2_5" />
      //     <AlertDescription mr="$2_5">{message}</AlertDescription>
      //     <CloseButton size="sm" onClick={props.close} />
      //   </Alert>
      // ),
    })
  },
  warning: (message: string) => {
    notificationService.show({
      status: "warning",
      title: firstUpperCase(message),
      // render: (props) => (
      //   <Alert status="warning" shadow="$md">
      //     <AlertIcon mr="$2_5" />
      //     <AlertDescription mr="$2_5">{message}</AlertDescription>
      //     <CloseButton size="sm" onClick={props.close} />
      //   </Alert>
      // ),
    })
  },
}

export { notify }
