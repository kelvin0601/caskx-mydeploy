"use client";

import SlideTransition, {
    TSlideTransition,
} from "@/components/shared/slide-transition";
import { AnimatePresence } from "motion/react";
import { PropsWithChildren, useEffect } from "react";
import { useKycStep } from "../provider/kyc-step-provider";
import FormChooseCountry from "./form-choose-contry";
import FormConfirmInfo from "./form-confirm-info";
import FormFaceCapture from "./form-face-capture";
import FormInsightCard from "./form-insight-card";
import FormInsightFaceCapture from "./form-insight-face-capture";
import FormSuccess from "./form-success";
import FormUploadDocument from "./form-upload-document";

export default function StepsKyc() {
    const { currentStep, setTotalStep } = useKycStep();

    useEffect(() => {
        setTotalStep(Object.keys(createRenderStep()).length);
    }, [createRenderStep(), setTotalStep]);

    const renderStep = (step: TStepType) => {
        return createRenderStep()[step]?.();
    };

    return (
        <div className="grid grid-cols-1 grid-rows-1 items-center overflow-hidden [&>*]:col-start-1 [&>*]:row-start-1 [&>*]:self-start">
            <AnimatePresence initial={false}>
                {renderStep(currentStep as TStepType)}
            </AnimatePresence>
        </div>
    );
}

export enum KycStep {
    INSIGHT_CARD = 1,
    CHOOSE_COUNTRY = 2,
    UPLOAD_DOCUMENT = 3,
    INSIGHT_FACE_CAPTURE = 4,
    FACE_CAPTURE = 5,
    CONFIRM_INFO = 6,
    SUCCESS = 7,
}

const createRenderStep = () => {
    return {
        [KycStep.INSIGHT_CARD]: () => {
            return (
                <SlideTransitionWrapper
                    className="insightCard"
                    key={"insightCard"}
                    duration={500}
                >
                    <FormInsightCard />
                </SlideTransitionWrapper>
            );
        },
        [KycStep.CHOOSE_COUNTRY]: () => {
            return (
                <SlideTransitionWrapper
                    className="chooseCountry"
                    key={"chooseCountry"}
                    duration={500}
                >
                    <FormChooseCountry />
                </SlideTransitionWrapper>
            );
        },
        [KycStep.UPLOAD_DOCUMENT]: () => {
            return (
                <SlideTransitionWrapper
                    className="uploadDocument"
                    key={"uploadDocument"}
                    duration={500}
                >
                    <FormUploadDocument />
                </SlideTransitionWrapper>
            );
        },
        [KycStep.INSIGHT_FACE_CAPTURE]: () => {
            return (
                <SlideTransitionWrapper
                    className="insightFaceCapture"
                    key={"insightFaceCapture"}
                    duration={500}
                >
                    <FormInsightFaceCapture />
                </SlideTransitionWrapper>
            );
        },
        [KycStep.FACE_CAPTURE]: () => {
            return (
                <SlideTransitionWrapper
                    className="faceCapture"
                    key={"faceCapture"}
                    duration={500}
                >
                    <FormFaceCapture />
                </SlideTransitionWrapper>
            );
        },
        [KycStep.CONFIRM_INFO]: () => {
            return (
                <SlideTransitionWrapper
                    className="confirmInfo"
                    key={"confirmInfo"}
                    duration={500}
                >
                    <FormConfirmInfo />
                </SlideTransitionWrapper>
            );
        },
        [KycStep.SUCCESS]: () => {
            return (
                <SlideTransitionWrapper
                    className="success"
                    key={"success"}
                    duration={500}
                >
                    <FormSuccess />
                </SlideTransitionWrapper>
            );
        },
    } as const;
};

const SlideTransitionWrapper = ({
    children,
    ...props
}: TSlideTransition & PropsWithChildren) => {
    const { isBackAction } = useKycStep();
    return (
        <SlideTransition
            {...props}
            id={props.className}
            isBackAction={isBackAction}
        >
            {children}
        </SlideTransition>
    );
};

export type TStepType = keyof ReturnType<typeof createRenderStep>;
