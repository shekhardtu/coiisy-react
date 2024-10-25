import googleIcon from "@/assets/icons/google.svg";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import IdentifierCard from "@/components/identifier/identifier";

export const description =
  "A login page with two columns. The first column has the login form with email and password. There's a Forgot your passwork link and a link to sign up if you do not have an account. The second column has a cover image."

export default function Login() {
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate("/dashboard")
  }

  return (
    <div className="flex flex-col">
      <Card className="mx-auto max-w-sm w-full mb-4">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" onClick={handleLogin}>
              Login
            </Button>

            <div className="flex items-center flex-col w-full ">
              <div className="relative w-full ">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/*  */}
              <div className="grid grid-cols-2 gap-4 w-full mt-4">
                <Button variant="outline" className="w-full">
                  <Github className="w-4 h-4 mr-2" />
                  Github
                </Button>
                <Button variant="outline" className="w-full">
                  <img
                    src={googleIcon}
                    alt="Google"
                    className="w-4 h-4 mr-2"
                  />
                  Google
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>

      </Card>
      <IdentifierCard />

    </div>

  )
}
