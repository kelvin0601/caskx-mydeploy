import {
    Form,
    FormControl,
    FormField,
    FormMessage,
} from "@/components/ui/form";
import HeadingKyc from "../heading";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectFlag } from "../select-flag";
import { useKycStep } from "../provider/kyc-step-provider";

export default function FormConfirmInfo() {
    const { nextStep, formData } = useKycStep();
    const confirmInfoSchema = z.object({
        nationality: z.string().min(1),
        fullName: z.string().min(1),
        dateBirth: z.string().min(1),
        monthBirth: z.string().min(1),
        yearBirth: z.string().min(1),
        address: z.string().min(1),
        city: z.string().min(1),
        postalCode: z.string().min(1),
    });

    const form = useForm<z.infer<typeof confirmInfoSchema>>({
        resolver: zodResolver(confirmInfoSchema),
        defaultValues: {
            fullName: "TRAN VAN TEO",
            nationality: formData.nationality,
            dateBirth: "08",
            monthBirth: "08",
            yearBirth: "2003",
            city: "Ho Chi Minh",
            address: "123 ABC Street",
            postalCode: "700000",
        },
    });
    const onSubmit = (data: z.infer<typeof confirmInfoSchema>) => {
        console.log(data);
        nextStep();
    };

    return (
        <div className="flex flex-col gap-6">
            <HeadingKyc title="Confirm information" />
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    id="sign-up"
                    onChange={() => form.clearErrors("root")}
                    className="w-full space-y-4"
                >
                    <FormField
                        name="nationality"
                        control={form.control}
                        render={({ field }) => (
                            <FormControl>
                                <div className="space-y-1.5">
                                    <Label htmlFor="nationality">
                                        Nationality
                                    </Label>
                                    <SelectFlag field={field} />
                                </div>
                            </FormControl>
                        )}
                    />
                    <FormField
                        name="fullName"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="fullName">Full name</Label>
                                <FormControl>
                                    <Input
                                        id="fullName"
                                        type="text"
                                        autoComplete="given-name"
                                        placeholder="Ex: John"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </div>
                        )}
                    />
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="year">
                            Date of birth (Year/Month/Day)
                        </Label>
                        <div className="flex items-center gap-1.5">
                            <FormField
                                name="yearBirth"
                                control={form.control}
                                render={({ field }) => <Input {...field} />}
                            />
                            <FormField
                                name="monthBirth"
                                control={form.control}
                                render={({ field }) => <Input {...field} />}
                            />
                            <FormField
                                name="dateBirth"
                                control={form.control}
                                render={({ field }) => <Input {...field} />}
                            />
                        </div>
                    </div>

                    <FormField
                        name="address"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="address">
                                    Residential address
                                </Label>
                                <FormControl>
                                    <Input
                                        id="lastName"
                                        type="text"
                                        autoComplete="family-name"
                                        placeholder="Ex: Doe"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </div>
                        )}
                    />
                    <FormField
                        name="postalCode"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="postalCode">
                                    Postal code (optional)
                                </Label>
                                <FormControl>
                                    <Input
                                        id="lastName"
                                        type="text"
                                        autoComplete="family-name"
                                        placeholder="Ex: Doe"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </div>
                        )}
                    />
                    <FormField
                        name="city"
                        control={form.control}
                        render={({ field }) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="postalCode">City</Label>
                                <FormControl>
                                    <Input
                                        id="city"
                                        type="text"
                                        placeholder="HCMC"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </div>
                        )}
                    />
                    <div className="text-sm text-typo-note">
                        By continuing, you agree that the above captured
                        personal data is accurate.
                    </div>
                    <div className="flex-center w-full">
                        <Button
                            variant={"secondary"}
                            onClick={nextStep}
                            className="mx-auto w-max"
                        >
                            Continue
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
