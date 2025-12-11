<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Category;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition()
    {
        $name = $this->faker->word();
        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name) . '-' . $this->faker->unique()->numberBetween(100,999),
        ];
    }
}
