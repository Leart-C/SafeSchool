<?php

namespace App\Services\Classes;

use App\Models\SchoolClass;
use Illuminate\Support\Collection;

class ListClassesService
{
    public function __construct(
        private readonly ClassResourceData $classResourceData
    ) {}

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function forSchool(int $schoolId): Collection
    {
        return SchoolClass::query()
            ->where('school_id', $schoolId)
            ->withCount([
                'teachers',
                'students',
            ])
            ->orderBy('name')
            ->get()
            ->map(fn (SchoolClass $schoolClass): array => $this->classResourceData->fromModel($schoolClass))
            ->values();
    }
}