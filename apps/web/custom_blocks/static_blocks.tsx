export const customBlocks = [
  {
    id: "hero-section",
    label: `
      <div style="text-align: center;">
        <img 
          src="/images/placeholder.png" 
          alt="Hero Section Thumbnail" 
          style="width:100%; height:auto; display:block; margin-bottom:5px;" 
        />
        <span>Hero Section</span>
      </div>
    `,
    category: "Sections",
    content: `
        <section class="bg-white dark:bg-gray-900">
          <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
            <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
              Welcome to Our Site
            </h1>
            <p class="mb-8 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
              Transform your ideas into reality with our powerful platform
            </p>
            <button class="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
              Get started
            </button>
          </div>
        </section>
      `,
  },
  {
    id: "feature-card",
    label: "Feature Card",
    category: "Components",
    content: `
        <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Feature Title
          </h5>
          <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
            Description of your amazing feature goes here.
          </p>
          <button class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800">
            Learn more
          </button>
        </div>
      `,
  },
  {
    id: "testimonial",
    label: "Testimonial",
    category: "Components",
    content: `
        <div class="max-w-screen-xl px-4 py-8 mx-auto text-center lg:py-16 lg:px-6">
          <figure class="max-w-screen-md mx-auto">
            <svg class="h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" viewBox="0 0 24 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" fill="currentColor"/>
            </svg>
            <blockquote>
              <p class="text-xl font-medium text-gray-900 dark:text-white">
                "Add your testimonial text here. Make it compelling and authentic."
              </p>
            </blockquote>
            <figcaption class="flex items-center justify-center mt-6 space-x-3">
              <div class="flex items-center divide-x-2 divide-gray-500 dark:divide-gray-700">
                <div class="pr-3 font-medium text-gray-900 dark:text-white">Client Name</div>
                <div class="pl-3 text-sm font-light text-gray-500 dark:text-gray-400">CEO, Company</div>
              </div>
            </figcaption>
          </figure>
        </div>
      `,
  },
  {
    id: "cta-section",
    label: "CTA Section",
    category: "Sections",
    content: `
        <section class="bg-gray-50 dark:bg-gray-800">
          <div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
            <div class="mx-auto max-w-screen-sm text-center">
              <h2 class="mb-4 text-3xl font-extrabold leading-tight text-gray-900 dark:text-white">
                Ready to get started?
              </h2>
              <p class="mb-6 font-light text-gray-500 dark:text-gray-400">
                Join thousands of satisfied customers using our platform.
              </p>
              <button class="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                Get Started
              </button>
            </div>
          </div>
        </section>
      `,
  },
];
