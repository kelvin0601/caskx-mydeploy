import ImagePreload from "@/components/shared/image-preload";
import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { useManageCask } from "../provider";

export default function BidAlertUpdate() {
    const { setOpenBidManager, dialogData } = useManageCask();
    const [quantity, setQuantity] = useState(dialogData.quantity || 1);
    const [price, setPrice] = useState(dialogData.price || 0);

    const handleUpdate = () => {
        // Update bid logic here
        console.log("Updating bid:", { ...dialogData, quantity, price });
        setOpenBidManager(false);
    };

    const handleCancel = () => {
        setOpenBidManager(false);
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6">
            <AlertDialogHeader>
                <ImagePreload
                    src="/icons/icon-edit.svg"
                    priority
                    width={80}
                    className="h-20 w-20"
                    height={80}
                />
            </AlertDialogHeader>
            <AlertDialogDescription className="text-center">
                Update your bid for{" "}
                <strong className="font-semibold text-typo-primary">
                    {dialogData.caskName}
                </strong>
            </AlertDialogDescription>

            <div className="w-full space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min="1"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Price per unit (£)</Label>
                    <Input
                        id="price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        min="0"
                        step="0.01"
                    />
                </div>
                <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-gray-600 text-sm">
                        Total: £{(quantity * price).toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="flex flex-row items-center gap-3">
                <AlertDialogCancel
                    className="h-full w-32"
                    onClick={handleCancel}
                >
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                    className="h-full w-32"
                    onClick={handleUpdate}
                >
                    Update Bid
                </AlertDialogAction>
            </div>
        </div>
    );
}
