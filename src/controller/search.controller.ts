import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationResponse } from 'src/common/pagination/pagination-response';
import { ApiPaginatedResponse } from 'src/common/pagination/pagination.decorator';
import { GetSearchMemberByNameRequestDto } from 'src/dto/request/get-search-member-by-name.request.dto';
import { GetSearchPostByHashTagRequestDto } from 'src/dto/request/get-search-post-by-hash-tag.request.dto';
import { GetSearchMemberByNameResponseDto } from 'src/dto/response/get-search-member-by-name.response.dto';
import { GetSearchPostByHashTagResponseDto } from 'src/dto/response/get-search-post-by-hash-tag.response.dto';
import { RolesGuard } from 'src/guard/roles.guard';
import { SearchService } from 'src/service/search.service';

@ApiTags('검색')
@Controller('search')
@UseGuards(RolesGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiOperation({ summary: '포스트 해시태그 검색' })
  @ApiPaginatedResponse(GetSearchPostByHashTagResponseDto)
  @Get('/post/hash-tag')
  async searchPostByHashTag(
    @Query() requestDto: GetSearchPostByHashTagRequestDto,
  ): Promise<PaginationResponse<GetSearchPostByHashTagResponseDto>> {
    const { postList, totalCount } = await this.searchService.searchPostByHashTag(requestDto);

    return PaginationResponse.of({
      data: postList,
      options: requestDto,
      totalCount: totalCount,
    });
  }

  @ApiOperation({ summary: '멤버 이름 검색' })
  @ApiPaginatedResponse(GetSearchMemberByNameResponseDto)
  @Get('/member/name')
  async searchMemberByName(
    @Req() req,
    @Query() requestDto: GetSearchMemberByNameRequestDto,
  ): Promise<PaginationResponse<GetSearchMemberByNameResponseDto>> {
    const { memberList, totalCount } = await this.searchService.searchUserByName(requestDto, req.user.id);

    return PaginationResponse.of({
      data: memberList,
      options: requestDto,
      totalCount: totalCount,
    });
  }
}
