import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "../ui/card";

export default function IdentifierCard() {
    return (
        <Card>
            <Link className="cursor-pointer w-full" to={"/identifier"}>
                <Button className="text-center text-sm py-3 w-full" variant={"link"} >
                    Login with OTP
                </Button>
            </Link>
        </Card>
    )
}