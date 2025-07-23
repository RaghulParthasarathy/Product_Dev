import React from "react";
import { CardBody, CardContainer, CardItem } from "./ui/3d-card"

export function ThreeDCardDemo({ head, subhead }) {
    return (
        <CardContainer className="inter-var">
            <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] rounded-xl p-6 border h-auto">
                <CardItem
                    translateZ="50"
                    className="text-xl font-bold text-neutral-600 dark:text-white"
                >
                    {head}
                </CardItem>
                <CardItem
                    as="p"
                    translateZ="60"
                    className="text-neutral-500 text-sm  mt-2 dark:text-neutral-300"
                >
                    {subhead}
                </CardItem>


            </CardBody>
        </CardContainer>
    );
}
