import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ActionFailure } from "@/types/api";

type FormErrorAlertProps = {
  failure: Pick<ActionFailure, "message" | "errors"> | null;
};

export function FormErrorAlert({ failure }: FormErrorAlertProps) {
  if (!failure) return null;

  const details = failure.errors.filter((error) => error !== failure.message);

  return (
    <Alert variant="destructive" role="alert">
      <CircleAlertIcon />
      <AlertTitle>{failure.message}</AlertTitle>
      {details.length > 0 && (
        <AlertDescription>
          <ul className="list-disc space-y-0.5 pl-4">
            {details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </AlertDescription>
      )}
    </Alert>
  );
}
