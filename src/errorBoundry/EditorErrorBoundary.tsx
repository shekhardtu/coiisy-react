import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleReportError = () => {
    // Implement your error reporting logic here
    const errorReport = {
      error: this.state.error?.toString(),
      errorInfo: this.state.errorInfo?.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    console.log('Error Report:', errorReport);
    // You could send this to your error tracking service
    // Example: sendToErrorTracking(errorReport);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                An unexpected error has occurred. You can try refreshing the page or report this issue to our support team.
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
                onClick={this.handleReportError}
                className="text-sm"
              >
                Report Issue
              </Button>
              <Button
                onClick={this.handleRefresh}
                className="text-sm"
                variant="default"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh Page
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