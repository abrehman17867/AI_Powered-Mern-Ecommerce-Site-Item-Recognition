import React from "react";

const ContactUs = () => {
  return (
    <div className=" p-5">
      <div className="grid grid-cols-1 md:grid-cols-12 border">
        <div className="bg-gray-900 md:col-span-4 p-10 text-white">
          <p className="mt-4 text-sm leading-7 font-regular uppercase">
            Contact
          </p>
          <h3 className="text-3xl sm:text-4xl leading-normal font-extrabold tracking-tight">
            Get In <span className="text-indigo-600">Touch</span>
          </h3>
          <p className="mt-4 leading-7 text-gray-200">
            We're here to help with any questions or feedback you have. Reach
            out to us for assistance with your orders, inquiries about our
            products, or any other support you need.
          </p>

          <div className="flex items-center mt-5">
            <svg
              className="h-6 mr-2 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 489.536 489.536"
            >
              <g>
                <g>
                  <rect
                    width="136.5"
                    x="177.054"
                    y="379.1"
                    height="20.8"
                  ></rect>
                  <circle cx="241.5" cy="241.5" r="120"></circle>
                </g>
              </g>
            </svg>
            <span className="text-sm">
              Johar Town, Kyaban-e-Jinnah Road, Lahore, Pakistan.
            </span>
          </div>
          <div className="flex items-center mt-5">
            <svg
              className="h-6 mr-2 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 60.002 60.002"
            >
              <circle cx="30" cy="30" r="15"></circle>
              <rect x="15" y="45" width="30" height="10"></rect>
            </svg>
            <span className="text-sm">info@ecommerce.com</span>
          </div>
        </div>
        <div className="md:col-span-8 p-10">
          <form>
            <div className="grid grid-cols-1 gap-6">
              <input
                type="text"
                placeholder="Full Name"
                className="border border-gray-300 p-3 rounded-lg w-full"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="border border-gray-300 p-3 rounded-lg w-full"
              />
              <textarea
                rows="4"
                placeholder="Message"
                className="border border-gray-300 p-3 rounded-lg w-full"
              ></textarea>
              <button
                type="submit"
                className="bg-indigo-600 text-white p-3 rounded-lg w-full"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
