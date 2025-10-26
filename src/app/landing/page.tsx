"use client";

import LandingPage from '@/components/LandingPage';

export default function LandingRoute() {
	// This route provides a standalone landing page for the app router.
	// Provide a simple onEnterApp handler that navigates to the root where
	// the main app UI (and the client-side LandingPage usage) lives.
	const handleEnter = () => {
		if (typeof window !== 'undefined') window.location.href = '/';
	};

	return <LandingPage onEnterApp={handleEnter} />;
}
