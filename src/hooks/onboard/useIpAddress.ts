import { useState, useEffect } from "react";

export const useIpAddress = () => {
  const [ipAddress, setIpAddress] = useState<string>("");

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => setIpAddress(data.ip))
      .catch((error) => {
        console.error("Error fetching IP address:", error);
        setIpAddress("0.0.0.0"); // Fallback IP address
      });
  }, []);

  return { ipAddress };
};
