import React from 'react';

export default function Offline() {
  return (
    <div className="flex items-center justify-center min-h-full  p-4">
      <div className="text-center p-8 max-w-md w-full">
        <img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAvCAYAAAChd5n0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAYASURBVGhD7ZlbaB1VFIZz5nJycjPmRkyNNCkqFXwpUfqgIpRSpXivacVYTW18sD6ERhu1bYxiwYcIgmixIF4iKgqNtOCloGDAKKKiD2qktl5iDfhgE4MlJibn+K199iR7JjMnp7mcNJgfFjOz97/XWv9ee++ZnOStYDnAtu2b4/F4u35cnsjPz9+IkDHLslLLVgwi6hGRisViyrSYPbr7nEZMXz3kI2RfKpXqwFQDgvIQ1D4xMdGlGiJQVVVVPDw8XBeLOZcmk5OrJycnay0rr5rxRclk0oUiEzOG2xHLsgcdx/09mUydKChwjw8NDQ3IxKU9LSAcx+mQapiVcZz4Q7pboaGhwS0oKFhP+yOW5b7PBAymx3iWHhtulvIpxrh/iPed4yReTiSK7qysrKzRIRYGON8fJYYlWGfbznFmViXlT3LupoX95bpuD5N0m0yWSma+sCxPTN5UIG/POJbTagpdaNOi+onXWlFRUaISmg+owozKxOMJJYaZa1lMMZ6xOn5iFdynEopAcLNPIZFIXIWT6tHR0R4c7WNjHkilkqqPdll6e8bHx59GzE429otyOND+J3YC+5HnU9gg9NM8j3MvsRIIr+Z+FcbBEFvLdQ3tca7iOhJwxT6hQm3k9IVujkZjY6NNck9Q1iSWQtBd0i5igpUx9swm287fUFpaWibP2ULEyZFPvG0k+BIxfputwuT0L9yHtYtwFBcXX4bTT01nIoa2JuknkG+ZyUYPnmbzgRzhbPLbiXNM4k7H8Vt6Ep3D5eXl5+mh00DljQweDhsoThl4v/C4+o7mtBhnwcR4kKWN36OZKkReX8O7SA9Rg1YzYCyMLI4Y8AtVadZ0JSbI4YTzxNgimjFdWDd97yH2I+xDOEdoO8Sk7cffVlkBnZ2dlh4XCrg34e8HM55p+P8KmqPIth2/NYxE0BRr+JmwEuIg7D2TPpqdeLvZF2VwZB/2I+qg7DPZn8p5AHL8IuiFKJ9Q6hURJxcHSczCQGFh4fWKEAE4HAD+bzNvz5DczmzEeCZcRH1LwrvLyspKVYAAyLMZjm/lyDNd56cZgMDbaTyFwzPc97DxLtBdPhDoBirYC2eHPLNc9poJz0eMZ0zQryS9S3wEwTa4ljx/1sIl1xbdNQ0pIafGhfrRh5KSkksI8I6XmFxxEnqayb23zEwxJmc20/57i4qKLhc/JmSpE/NqxNbppuzAgBYGzjjRmBEJtl04YWKonvcnwDq418G9g7Y2rs/z3AdnxPQXZvD+pgr3aD9zB0GfzDSTIgahG4UbUZnIo5nqr8J/E+PeFT+mX9OkD446/ucEWWaziOgjkW1QK9IjlJiw94xXmUhwsKyD90ZUPGL9UVtbW6DpZwdmuj7MMQEHKLdaUmGgP6Qys4sREHMT3P5gXNpO19TUFGraWSOGg1c9p3JljXfzIqvU/ZFg3IxvM+OlKRUIPRUFspmJ86YZF38dunvOkDf1Lkr7LM636LYZ4INxDf17XTf+mesm7pY2xvmOZnOZiS/uj2XyKfuHuF1ct+qmxQMC6knoEAHPeMnKS5LgGb6a02K4PijP2JcI2ixtSwKCt5JM6IemJCgzKjw4IS/N9DLjXr1nNP9g1GfKooFEZLn5kg+aTrhV8wPLTG1gVRna7zX4D0hbzoCIz82kTJOE6P8ee4vEHoOujk3uw/44Uz8Ccr9DnrGj8pwzkNRhM3kxEh9heTzH++dKKKGf52FiWKJeZdro362IuQLB15L4ST2LIuI1ee/o7owg2chvs6WCnPebSewK/Zw1wsVk99LMOVhiW+Lx/Ldt2/2YJLup2AbdpUCbb5ll+zmTU1Ap+cI1kpya9Uc1ReGcFsN3WJM/uWmTdvqv0VSFCDFL/y8Nkuo1kw8aSb6iqVMIipH7pa5MjCROmokHTYRqrg9hleFZfoxL/0qSa7A3+szEg0b/65o6A4jxnWayz2hbr7tzC16KkT9uS7v3F2UUvMqIcb90FRGQgPw4N0MEM/yUpmQEvANMyOP6cWlBIs38MfUBSX2DsCMcybforhWsYAUr+F8jL+8/Z+TnC0JzDXUAAAAASUVORK5CYII="
          alt="Offline Icon"
          className="mx-auto mb-6 w-20 h-20"
        />
        <h1 className="text-2xl font-semibold mb-2">No Internet Connection</h1>
        <p className="text-gray-600 mb-6">Please check your network and try again.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            type="button"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => location.reload()}
          >
            Retry
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
