import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class EditorErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Editor Error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center p-4 bg-background/95">
          <Card className="w-full max-w-md shadow-lg border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Editor Error
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The editor encountered an unexpected error. You can try refreshing the page or retrying the operation.
              </p>

              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-[200px]">
                  <p className="font-semibold text-destructive">
                    {this.state.error?.toString()}
                  </p>
                  <pre className="mt-2 text-muted-foreground">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={this.handleRetry}
                className="text-sm"
              >
                Retry
              </Button>
              <Button
                onClick={this.handleRefresh}
                className="text-sm"
                variant="default"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh Editor
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EditorErrorBoundary;