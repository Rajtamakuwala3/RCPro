"use client";

import { useToast, Button } from "@chakra-ui/react";

export const Toaster = () => {
  const toast = useToast();

  const showToast = () => {
    toast({
      title: "Notification",
      description: "This is a Chakra UI toast message.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "bottom-right",
    });
  };

  return (
    <div className="p-4">
      <Button colorScheme="teal" onClick={showToast}>
        Show Toast
      </Button>
    </div>
  );
};
