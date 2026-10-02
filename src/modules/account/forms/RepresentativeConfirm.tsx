import { Button } from "@/components/ui/button";
import { KEY_FORM_MAP, useAccountActions } from "@/store";
import React from "react";

export const RepresentativeConfirm = () => {
    const { closeModal, openModal } = useAccountActions();
    return (
        <div className="flex flex-row items-center justify-center gap-2">
            <Button onClick={closeModal} variant="outline">
                Cancel
            </Button>
            <Button
                onClick={() => {
                    openModal(KEY_FORM_MAP.CREATE_PERSON);
                }}
                variant={"secondary"}
            >
                Update representative
            </Button>
        </div>
    );
};
