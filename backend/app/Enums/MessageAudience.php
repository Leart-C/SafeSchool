<?php

namespace App\Enums;

enum MessageAudience: string
{
    case School = 'school';
    case Teachers = 'teachers';
    case Parents = 'parents';
    case Students = 'students';
    case ClassAudience = 'class';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(
            fn (self $audience): string => $audience->value,
            self::cases(),
        );
    }
}