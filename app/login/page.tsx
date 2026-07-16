import {
  Suspense,
} from "react";

import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <LoginLoading />
      }
    >
      <LoginClient />
    </Suspense>
  );
}

function LoginLoading() {
  return (
    <main
      style={{
        minHeight:
          "100vh",

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        padding:
          "24px",

        color:
          "#8f0d25",

        backgroundColor:
          "#fff7ed",
      }}
    >
      <div
        style={{
          minWidth:
            "240px",

          padding:
            "28px",

          border:
            "1px solid #ead7c4",

          borderRadius:
            "24px",

          backgroundColor:
            "#fffaf3",

          boxShadow:
            "0 18px 45px rgba(95, 31, 35, 0.1)",

          textAlign:
            "center",
        }}
      >
        <div
          style={{
            marginBottom:
              "10px",

            fontSize:
              "30px",
          }}
        >
          ❦
        </div>

        <p
          style={{
            margin:
              0,

            fontFamily:
              "Georgia, serif",

            fontSize:
              "17px",
          }}
        >
          Preparing login...
        </p>
      </div>
    </main>
  );
}