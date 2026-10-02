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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useStoreDialogWrap } from "../provider/security-dialog-provider";
import { useDisableButtonForm } from "@/hooks/useDisableButtonForm";
import { useQueryClient } from "@tanstack/react-query";
import { TWO_FA_KEYS } from "@/lib/constants/key";

export default function FormSessionAdd() {
    const { setStep, setSessionData } = useStoreDialogWrap();
    const schemaForm = z.object({
        name: z.string().min(1, { message: "Name is required" }),
    });
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof schemaForm>>({
        resolver: zodResolver(schemaForm),
        defaultValues: {
            name: "",
        },
    });
    const onSubmit = async (data: z.infer<typeof schemaForm>) => {
        // call api here
        queryClient.invalidateQueries({
            queryKey: [TWO_FA_KEYS.ENABLE_GOOGLE_AUTH],
        });
        setSessionData({
            name: data.name,
        });

        setStep("setupGoogleAuth");
    };
    const handleBack = () => {
        setStep("setupGoogleAuthActive", true);
    };
    const isDisabled = useDisableButtonForm(form);
    return (
        <div className="flex flex-col gap-8 mb:gap-6">
            <DialogHeader className="border-none pb-0 text-center">
                <div className="flex w-full flex-col items-center gap-2">
                    <DialogTitle className="text-center font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                        Connect Device
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm text-typo-soft">
                        Name this device. This will help identify each device
                        associated with the account.
                    </DialogDescription>
                </div>
            </DialogHeader>
            <div className="flex flex-col gap-5">
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
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Device name"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex w-full flex-row gap-1">
                            <Button
                                className="flex-1"
                                onClick={handleBack}
                                variant="outline"
                                type="button"
                                size="xl"
                            >
                                Back
                            </Button>
                            <Button
                                className="flex-1"
                                variant={"action"}
                                type="submit"
                                size="xl"
                                disabled={
                                    isDisabled || form.formState.isSubmitting
                                }
                            >
                                Continue
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
