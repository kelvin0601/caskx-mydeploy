import Image from "next/image";
import loader from "@/assets/loader.gif";

const LoadingPage = () => {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Image src={loader} height={150} width={150} alt="loading" />
        </div>
    );
};

export default LoadingPage;
