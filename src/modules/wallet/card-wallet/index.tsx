import ImagePreload from "@/components/shared/image-preload";
import { convertTextHidden } from "@/lib/utils";
import { useStoreDialogWrap } from "../provider/dialog-wallet-provider";
import { TWalletItem } from "../provider/wallet-provider";

export default function CardWallet(props: Omit<TWalletItem, "name">) {
    const { id, number, images, isDefault } = props;
    const { setIsOpenDialog, setSessionData } = useStoreDialogWrap();

    const handleClick = () => {
        setIsOpenDialog(true);
        setSessionData({
            id,
            images,
            isDefault,
            number,
            name: "",
        });
    };
    return (
        <div
            className="relative mx-2.5 cursor-pointer select-none"
            onClick={handleClick}
        >
            <div className="aspect-[28/18] w-[17.5rem] flex-shrink-0 overflow-hidden rounded-md">
                {images && (
                    <ImagePreload width={280} height={180} src={images} />
                )}
            </div>
            {isDefault && (
                <div className="absolute bottom-[1.125rem] right-[1.125rem] flex flex-row items-center gap-1 rounded-2xl border border-solid border-bd-brown bg-bg-sf1 px-2 py-0.5">
                    <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3F444B]" />
                    <div className="text-xs font-medium text-typo-primary">
                        Default
                    </div>
                </div>
            )}

            <div className="absolute left-5 top-1/2 -translate-y-1/2 font-coda text-base text-typo-dark-primary">
                {convertTextHidden(number, number.length - 4)}
            </div>
        </div>
    );
}
