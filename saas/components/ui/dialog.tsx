
"use client";

import * as React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  type ModalProps,
  type ModalContentProps,
  type ModalHeaderProps,
  type ModalBodyProps,
} from "@chakra-ui/react";
import { cn } from "@/lib/utils";

// --- Dialog raíz ---
interface DialogProps extends Omit<ModalProps, "children"> {
  children: React.ReactNode;
}

const Dialog = ({ children, ...props }: DialogProps) => {
  return (
    <Modal {...props}>
      <ModalOverlay />
      {children}
    </Modal>
  );
};

// --- Trigger (passthrough) ---
const DialogTrigger = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// --- Content ---
const DialogContent = React.forwardRef<
  React.ElementRef<typeof ModalContent>,
  ModalContentProps
>(function DialogContent({ className, children, ...props }, ref) {
  return (
    <ModalContent ref={ref} className={className} {...props}>
      <ModalCloseButton />
      {children}
    </ModalContent>
  );
});
DialogContent.displayName = "DialogContent";

// --- Header ---
const DialogHeader = React.forwardRef<
  React.ElementRef<typeof ModalHeader>,
  ModalHeaderProps
>(function DialogHeader({ className, ...props }, ref) {
  return <ModalHeader ref={ref} className={className} {...props} />;
});
DialogHeader.displayName = "DialogHeader";

// --- Title (HTML, no Chakra) ---
const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <h2
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
});
DialogTitle.displayName = "DialogTitle";

// --- Description (HTML, no Chakra) ---
const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
DialogDescription.displayName = "DialogDescription";

// --- Body ---
const DialogBody = React.forwardRef<
  React.ElementRef<typeof ModalBody>,
  ModalBodyProps
>(function DialogBody({ className, ...props }, ref) {
  return <ModalBody ref={ref} className={className} {...props} />;
});
DialogBody.displayName = "DialogBody";

// --- Footer (HTML, no Chakra) ---
const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function DialogFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  );
});
DialogFooter.displayName = "DialogFooter";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
};
``
