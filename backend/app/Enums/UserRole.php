<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Director = 'director';
    case Teacher = 'teacher';
    case Parent = 'parent';
    case Student = 'student';
}
