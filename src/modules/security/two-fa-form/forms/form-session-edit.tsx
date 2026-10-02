import IconClose from "@/components/shared/icons/icon-close";
import { Button } from "@/components/ui/button";
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DEVICE_KEYS } from "@/lib/constants/key";
import { authWith2Fa } from "@/services/auth-2fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { getErrorMessage } from "@/lib/utils";
import { useStoreDialogWrap } from "../provider/security-dialog-provider";

export default function FormSessionEdit() {
    const queryClient = useQueryClient();
    const { setStep, sessionData, setIsOpenDialog } = useStoreDialogWrap();
    const schemaForm = z.object({
        name: z.string().min(1, { message: "Name is required" }),
    });
    const updateDeviceMutation = useMutation({
        mutationKey: [DEVICE_KEYS.UPDATE_DEVICE],
        mutationFn: authWith2Fa.updateDevices,
    });
    const form = useForm<z.infer<typeof schemaForm>>({
        resolver: zodResolver(schemaForm),
        defaultValues: {
            name: sessionData?.name || "",
        },
    });
    const onSubmit = async (data: z.infer<typeof schemaForm>) => {
        if (!data || !sessionData) return;

        if (data.name === sessionData?.name) {
            form.setError("name", {
                message:
                    "The new device name must be different from the previous one",
            });
            return;
        }
        try {
            const result = await updateDeviceMutation.mutateAsync({
                deviceId: sessionData.id || "",
                deviceName: data.name,
            });
            if (result) {
                queryClient.invalidateQueries({
                    queryKey: [DEVICE_KEYS.GET_DEVICES],
                });
            }
            toast.success("Device renamed");
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to rename device"));
        }

        setIsOpenDialog(false);
    };
    const handleBack = () => {
        setStep("setupGoogleAuthActive", true);
    };
    return (
        <div className="flex flex-col gap-6">
            <DialogHeader className="border-none pb-0 text-center">
                <div className="flex w-full flex-col items-center gap-2">
                    <DialogTitle className="text-center font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                        Rename Device
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm text-typo-soft">
                        Name this device. This will help identify each device
                        associated with the account.
                    </DialogDescription>
                </div>
            </DialogHeader>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6 mb:space-y-5"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="text-sm text-typo-primary">
                                    Name
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            {...field}
                                            type="text"
                                            className="pr-7"
                                            placeholder="Device name"
                                        />
                                        <div
                                            onClick={() => {
                                                field.onChange("");
                                            }}
                                            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-typo-primary"
                                        >
                                            <IconClose />
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex w-full flex-row gap-1">
                        <Button
                            className="flex-1"
                            type="button"
                            variant={"outline"}
                            size="xl"
                            onClick={handleBack}
                        >
                            Back
                        </Button>
                        <Button
                            className="flex-1"
                            type="submit"
                            variant={"action"}
                            size="xl"
                            disabled={form.formState.isSubmitting}
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
