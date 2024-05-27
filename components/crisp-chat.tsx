"use client";

import { Crisp } from "crisp-sdk-web";
import { useEffect } from "react";

export const CrispChat = () => {
	useEffect(() => {
		Crisp.configure("2c2ebeaa-7cdf-4570-a49b-beb60cacc7da");
	}, []);

	return null;
};
