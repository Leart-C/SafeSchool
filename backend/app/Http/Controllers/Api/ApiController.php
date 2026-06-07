<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

abstract class ApiController extends Controller
{
    /**
     * @param  array<string, mixed>  $meta
     */
    protected function success(
        mixed $data = null,
        string $message = 'OK',
        int $status = Response::HTTP_OK,
        array $meta = []
    ): JsonResponse {
        $payload = [
            'data' => $data,
            'message' => $message,
        ];

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }

    /**
     * @param  array<string, mixed>  $meta
     */
    protected function created(
        mixed $data = null,
        string $message = 'Created.',
        array $meta = []
    ): JsonResponse {
        return $this->success($data, $message, Response::HTTP_CREATED, $meta);
    }

    protected function noContent(): JsonResponse
    {
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * @param  array<string, mixed>  $errors
     */
    protected function error(
        string $message = 'Something went wrong.',
        int $status = Response::HTTP_BAD_REQUEST,
        array $errors = []
    ): JsonResponse {
        $payload = [
            'message' => $message,
            'errors' => $errors,
        ];

        return response()->json($payload, $status);
    }

    /**
     * @param  array<string, mixed>  $errors
     */
    protected function validationError(
        array $errors,
        string $message = 'The given data was invalid.'
    ): JsonResponse {
        return $this->error($message, Response::HTTP_UNPROCESSABLE_ENTITY, $errors);
    }
}