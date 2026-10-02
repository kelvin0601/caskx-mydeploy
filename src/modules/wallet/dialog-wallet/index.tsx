"use client";

import IconTrash from "@/components/shared/icons/icon-trash";
import { Button } from "@/components/ui/button";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useStoreDialogWrap } from "../provider/dialog-wallet-provider";
import CardWallet from "../card-wallet";
import { useStoreAlertWrap } from "../provider/alert-wallet-provier";
import { useWalletContext } from "../provider/wallet-provider";

export default function DialogWallet() {
    const { sessionData, setIsOpenDialog } = useStoreDialogWrap();
    const { setOpenAlert, setDataAlert } = useStoreAlertWrap();
    const { setWallet, wallet } = useWalletContext();
    const { name, number, images, isDefault } = sessionData || {};

    return (
        <DialogContent className="w-[37.5rem]">
            <div className="flex flex-col gap-5">
                <DialogHeader>
                    <DialogTitle>Card details</DialogTitle>
                </DialogHeader>
                <div className="flex w-full flex-col">
                    <div className="aspect-[28/18] w-[17.5rem] overflow-hidden rounded-xl">
                        <CardWallet
                            id={name || ""}
                            number={number || ""}
                            images={images}
                            isDefault={false}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="text-base font-semibold text-typo-primary">
                        Manage
                    </div>
                    <div className="flex flex-col">
                        <WalletSubItem>
                            <>
                                <div className="text-base text-typo-primary">
                                    Set as default
                                </div>
                                <Switch defaultChecked={isDefault} />
                            </>
                        </WalletSubItem>
                        <WalletSubItem>
                            <>
                                <div className="text-base text-typo-primary">
                                    Delete card
                                </div>
                                <div
                                    className="h-4 w-4 cursor-pointer"
                                    onClick={() => {
                                        setOpenAlert(true);
                                        setDataAlert({
                                            actionPassed: () => {},
                                        });
                                        setWallet(
                                            wallet.filter(
                                                (item) => item.id !== name
                                            )
                                        );
                                    }}
                                >
                                    <IconTrash />
                                </div>
                            </>
                        </WalletSubItem>
                    </div>
                    <Button
                        variant={"secondary"}
                        className="self-end"
                        onClick={() => {
                            setIsOpenDialog(false);
                        }}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </DialogContent>
    );
}

const WalletSubItem = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex w-full flex-row items-center justify-between gap-5 border-t border-solid border-bd-brown py-2 last:border-b">
            {children}
        </div>
    );
};
