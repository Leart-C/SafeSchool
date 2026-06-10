<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreMessageRequest;
use App\Http\Requests\UpdateMessageRequest;
use App\Models\Message;
use App\Services\Messages\ArchiveMessageService;
use App\Services\Messages\CreateMessageService;
use App\Services\Messages\ListMessagesService;
use App\Services\Messages\UpdateMessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class MessageController extends ApiController
{
    public function index(
        Request $request,
        ListMessagesService $messages
    ): JsonResponse {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        return $this->success([
            'messages' => $messages->forSchool($user->school_id),
        ], 'Messages retrieved.');
    }

    public function store(
        StoreMessageRequest $request,
        CreateMessageService $messages
    ): JsonResponse {
        $user = $request->user();

        if (! $user->can('messages.create')) {
            return $this->error(
                'You are not allowed to create messages.',
                status: 403,
            );
        }

        try {
            $message = $messages->create($user, $request->validated());
        } catch (InvalidArgumentException $exception) {
            return $this->error(
                $exception->getMessage(),
                status: 404,
            );
        }

        return $this->created([
            'message' => $message,
        ], 'Message created.');
    }

    public function update(
        UpdateMessageRequest $request,
        Message $message,
        UpdateMessageService $messages
    ): JsonResponse {
        $user = $request->user();

        if (! $user->can('messages.create')) {
            return $this->error(
                'You are not allowed to update messages.',
                status: 403,
            );
        }

        try {
            $updatedMessage = $messages->update($user, $message, $request->validated());
        } catch (InvalidArgumentException $exception) {
            return $this->error(
                $exception->getMessage(),
                status: 404,
            );
        }

        return $this->success([
            'message' => $updatedMessage,
        ], 'Message updated.');
    }

    public function archive(
        Request $request,
        Message $message,
        ArchiveMessageService $messages
    ): JsonResponse {
        $user = $request->user();

        if (! $user->can('messages.create')) {
            return $this->error(
                'You are not allowed to archive messages.',
                status: 403,
            );
        }

        try {
            $messages->archive($user, $message);
        } catch (InvalidArgumentException $exception) {
            return $this->error(
                $exception->getMessage(),
                status: 404,
            );
        }

        return $this->success(null, 'Message archived.');
    }
}