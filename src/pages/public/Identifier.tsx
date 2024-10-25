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
import { sendOtp, verifyOtp } from "@shekhardtu/tsoa-client/services.gen";
import { SendOtpResponse } from "@shekhardtu/tsoa-client/types.gen";
import { Github } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const description =
  "A login page with two columns. The first column has the login form with email and password. There's a Forgot your passwork link and a link to sign up if you do not have an account. The second column has a cover image."

export default function Identifier() {

  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState("")
  const [identifier, setIdentifier] = useState("")

  const navigate = useNavigate()

  const [verifyOtpBody, setVerifyOtpBody] = useState<SendOtpResponse

  >({
    user: {
      identifier: "",
      otp: ""
    }

  })
  const handleIdentifierSubmit = async () => {
    // navigate("/dashboard")



    const sendOtpResponse = await sendOtp({ body: { identifier } })
    const { data } = sendOtpResponse;




    setVerifyOtpBody(() => (data as SendOtpResponse))
    setOtp(data?.user?.otp as string)
    setShowOtp(true)
  }

  const handleOtpSubmit = async () => {
    const { data } = await verifyOtp({
      body: {
        identifier: verifyOtpBody.user.identifier,
        otp: verifyOtpBody.user.otp
      }
    })




    if (data) {
      local("json").set("user", data.user)
      local("json").set("tokens", data.tokens as unknown as string)
      navigate("/dashboard")
    }
  }



  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Login with OTP</CardTitle>
        <CardDescription>
          Enter your email or phone number to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {showOtp ?
            <div>
              <div className="grid gap-2 mb-4">

                <Label htmlFor="otp">OTP</Label>
                <Input
                  name="otp"
                  id="otp"
                  type="number"
                  placeholder="otp"
                  value={otp}
                  required
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 4) {
                      setOtp(value);
                    }
                  }}
                />
              </div>

              <Button type="submit" className="w-full" onClick={handleOtpSubmit}>
                Submit
              </Button>


            </div>

            : <div>
              <div className="grid gap-2 mb-4">
                <Label htmlFor="identifier">Email or Phone Number</Label>
                <Input
                  name="identifier"
                  id="identifier"
                  type="text"
                  value={identifier}
                  placeholder="email or phone number"
                  required
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" onClick={handleIdentifierSubmit}>
                Submit
              </Button>
            </div>
          }

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

  )
}


