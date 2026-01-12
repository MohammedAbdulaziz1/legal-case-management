<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:20480', // 20MB in KB (20480 KB = 20 MB)
                'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,gif,txt,rtf,odt,ods,odp',
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.required' => 'The file field is required.',
            'file.file' => 'The uploaded file must be a valid file.',
            'file.max' => 'The file size must not exceed 20MB.',
            'file.mimes' => 'The file must be one of the following types: pdf, doc, docx, xls, xlsx, ppt, pptx, jpg, jpeg, png, gif, txt, rtf, odt, ods, odp.',
            'name.required' => 'The document name is required.',
            'name.max' => 'The document name must not exceed 255 characters.',
        ];
    }
}
