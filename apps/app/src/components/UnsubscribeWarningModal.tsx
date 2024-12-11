import { Description } from "@radix-ui/react-dialog";
import { Text } from "@radix-ui/themes";
import { Button } from "@v1/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@v1/ui/dialog";

interface UnsubscribeWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  unsubscribeHref: string;
}

export function UnsubscribeWarningModal({
  isOpen,
  onClose,
  unsubscribeHref,
}: UnsubscribeWarningModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <Text weight="bold">Active Subscription</Text>
          <DialogDescription>
            You have an active subscription. To delete your account, you need to
            unsubscribe first.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}