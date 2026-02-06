import { RegisterForm } from "@/app/(auth)/register/components/RegisterForm";
import Image from "next/image";

export default function Page() {
    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <main className="flex-1 md:p-12 flex flex-col justify-center bg-white">
                <div className="w-full md:max-w-xl mx-auto flex flex-col items-center">

                    <div className="relative w-full h-[300px] mb-8 overflow-hidden rounded-xl">
                        <h1 className="absolute z-10 text-white text-4xl font-light mb-6 bottom-0 w-full text-center drop-shadow-lg italic">
                            Registro
                        </h1>
                        <Image
                            src="/login_image.png"
                            alt="Register representativo"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                    </div>

                    <div className="w-full max-w-sm">
                        <RegisterForm />
                    </div>
                </div>
            </main>
        </div>
    );
}

