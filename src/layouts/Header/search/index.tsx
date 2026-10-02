"use client";
import IconSearch from "@/components/shared/icons/icon-search";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { searchSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function Search() {
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            search: "",
        },
    });

    const onSubmit = (data: { search: string }) => {
        if (data.search.trim()) {
            router.push(`/search?q=${encodeURIComponent(data.search)}`);
        }
    };

    return (
        <div className="flex h-full w-full items-center">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="h-full w-full"
                >
                    <FormField
                        name="search"
                        control={form.control}
                        render={({ field }) => {
                            return (
                                <FormControl className="relative h-full md:w-full mb:block">
                                    <div className="group flex w-full items-center justify-start gap-2 [&_div]:h-full">
                                        <span
                                            className={cn(
                                                "absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-typo-dark-sub transition-colors group-focus-within:text-typo-dark-primary mb:left-4"
                                            )}
                                        >
                                            <IconSearch />
                                        </span>
                                        <Input
                                            {...field}
                                            id="search"
                                            type="text"
                                            placeholder="Search..."
                                            className="h-full w-full flex-1 !border-x border-y-0 !border-bd-brown bg-transparent py-3.5 pl-12 pr-5 text-base font-normal text-typo-dark-primary shadow-none outline-none transition-colors placeholder:text-typo-dark-sub focus-visible:border-bd-brown-lighter tb:h-14 tb:w-[13.3rem] tb:pl-11 mb:h-[3.8125rem] mb:!border-x-0 mb:border-b mb:py-5 mb:pl-10 mb:pr-4 mb:text-base"
                                        />
                                    </div>
                                </FormControl>
                            );
                        }}
                    />
                </form>
            </Form>
        </div>
    );
}
