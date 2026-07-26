type FeaturePlaceholderPageProps = {
	eyebrow: string;
	title: string;
	description: string;
};

export function FeaturePlaceholderPage({
	eyebrow,
	title,
	description,
}: FeaturePlaceholderPageProps) {
	return (
		<section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
			<p className="text-xs font-bold tracking-[0.18em] text-teal-300/80 uppercase">
				{eyebrow}
			</p>
			<h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-100 sm:text-4xl">
				{title}
			</h1>
			<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
				{description}
			</p>
		</section>
	);
}
