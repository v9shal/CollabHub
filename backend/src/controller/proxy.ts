import axios from "axios";
import type { Request, Response } from "express";
import type { AxiosRequestConfig, AxiosError } from "axios";

// ✅ Type definitions
interface AuthBearer {
  type: "bearer";
  token: string;
}

interface AuthApiKey {
  type: "api_key";
  key: string;
  value: string;
}

interface AuthBasic {
  type: "basic";
  username: string;
  password: string;
}

type AuthConfig = AuthBearer | AuthApiKey | AuthBasic;

interface ExecuteRequestBody {
  url: string;
  method: string;
  headers?: Record<string, string>;
  auth?: AuthConfig;
  body?: any;
}

// ✅ Valid HTTP methods
const VALID_HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

/**
 * Execute an HTTP request as a proxy
 * POST /api/execute
 */
export const executeRequest = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { url, method, headers, auth, body } = req.body as ExecuteRequestBody;

    // ✅ Validate required fields
    if (!url?.trim()) {
      return res.status(400).json({ message: "URL is required" });
    }

    if (!method?.trim()) {
      return res.status(400).json({ message: "Method is required" });
    }

    // ✅ Validate HTTP method
    const normalizedMethod = method.trim().toUpperCase();
    if (!VALID_HTTP_METHODS.includes(normalizedMethod)) {
      return res.status(400).json({
        message: `Invalid HTTP method. Must be one of: ${VALID_HTTP_METHODS.join(", ")}`,
      });
    }

    // ✅ Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    // ✅ Build axios config
    const config: AxiosRequestConfig = {
      url: url.trim(),
      method: normalizedMethod,
      headers: headers || {},
      validateStatus: () => true, // ✅ Don't throw on non-2xx status codes
    };

    // ✅ Add body only for methods that support it
    if (["POST", "PUT", "PATCH"].includes(normalizedMethod) && body) {
      config.data = body;
    }

    // ✅ Handle authentication
    if (auth) {
      switch (auth.type) {
        case "bearer":
          if (!auth.token?.trim()) {
            return res.status(400).json({
              message: "Bearer token is required for bearer auth",
            });
          }
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${auth.token.trim()}`,
          };
          break;

        case "api_key":
          if (!auth.key?.trim() || !auth.value?.trim()) {
            return res.status(400).json({
              message: "API key name and value are required for API key auth",
            });
          }
          config.headers = {
            ...config.headers,
            [auth.key]: auth.value,
          };
          break;

        case "basic":
          if (!auth.username?.trim() || !auth.password) {
            return res.status(400).json({
              message: "Username and password are required for basic auth",
            });
          }
          // ✅ Axios handles Basic Auth encoding
          config.auth = {
            username: auth.username,
            password: auth.password,
          };
          break;

        default:
          return res.status(400).json({
            message: "Invalid auth type. Must be: bearer, api_key, or basic",
          });
      }
    }

    // ✅ Set reasonable timeout (30 seconds)
    config.timeout = 30000;

    // ✅ Execute request
    const startTime = Date.now();
    const response = await axios(config);
    const duration = Date.now() - startTime;

    // ✅ Return response with metadata
    return res.status(200).json({
      success: true,
      statusCode: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      metadata: {
        duration: `${duration}ms`,
        size: JSON.stringify(response.data).length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    // ✅ Handle Axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Network error (no response received)
      if (!axiosError.response) {
        return res.status(503).json({
          success: false,
          message: "Network error: Unable to reach the server",
          error: axiosError.message,
          code: axiosError.code,
        });
      }

      // Server responded with error status
      return res.status(200).json({
        success: false,
        statusCode: axiosError.response.status,
        statusText: axiosError.response.statusText,
        headers: axiosError.response.headers,
        data: axiosError.response.data,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    // ✅ Handle other errors
    console.error("Execute request error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while executing request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};