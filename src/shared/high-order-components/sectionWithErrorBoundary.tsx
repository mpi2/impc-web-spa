import Card from "@/components/Card";
import { Alert } from "react-bootstrap";
import { ErrorBoundary } from "react-error-boundary";
import React from "react";

export function sectionWithErrorBoundary<P>(
  Component: React.ComponentType<P>,
  title: string,
  id: string,
  message: string = 'Something went wrong. Please try later.',
) {
  return (props: P) => {
    return (
      <ErrorBoundary fallback={
        <Card id={id}>
          <h2>{title}</h2>
          <Alert variant="danger">
            {message}
          </Alert>
        </Card>
      }>
        <Component {...props} />
      </ErrorBoundary>
    )
  };
}